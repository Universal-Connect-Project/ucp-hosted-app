/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Request, Response } from "express";
import { getPaginatedInstitutions } from "./getPaginatedInstitutions";
import { DEFAULT_PAGINATION_PAGE_SIZE } from "../shared/const";
import { Institution } from "../models/institution";
import { checkIsSorted } from "../test/checkIsSorted";
import { PaginatedInstitutionsResponse } from "./consts";
import { createTestInstitution } from "../test/createTestInstitution";

const buildInstitutionRequest = ({
  search,
  page,
  pageSize,
  aggregatorName,
  supportsIdentification,
  supportsAggregation,
  supportsHistory,
  supportsRewards,
  supportsBalance,
  supportsVerification,
  supportsOauth,
  includeInactiveIntegrations,
  sortBy,
}: {
  search?: string;
  page?: number;
  pageSize?: number;
  aggregatorName?: string[] | string;
  supportsIdentification?: boolean;
  supportsAggregation?: boolean;
  supportsHistory?: boolean;
  supportsRewards?: boolean;
  supportsBalance?: boolean;
  supportsVerification?: boolean;
  supportsOauth?: boolean;
  includeInactiveIntegrations?: boolean;
  sortBy?: string;
}): Request => {
  return {
    query: {
      search,
      page,
      pageSize,
      aggregatorName,
      supportsIdentification: supportsIdentification ? "true" : undefined,
      supportsAggregation: supportsAggregation ? "true" : undefined,
      supportsHistory: supportsHistory ? "true" : undefined,
      supportsRewards: supportsRewards ? "true" : undefined,
      supportsBalance: supportsBalance ? "true" : undefined,
      supportsVerification: supportsVerification ? "true" : undefined,
      supportsOauth: supportsOauth ? "true" : undefined,
      includeInactiveIntegrations: includeInactiveIntegrations
        ? "true"
        : undefined,
      sortBy,
    },
  } as unknown as Request;
};

const createFilterTest = ({
  aggregatorIntegrationPropKey,
  filterKey,
}: {
  aggregatorIntegrationPropKey: string;
  filterKey: string;
}) => {
  it(`filters by ${filterKey}`, async () => {
    await Institution.truncate({ cascade: true });

    const aggregatorIntegration = {
      isActive: true,
      supports_aggregation: false,
      supports_history: false,
      supports_oauth: false,
      supports_identification: false,
      supports_verification: false,
      supportsRewards: false,
      supportsBalance: false,
    };

    const institutionThatShouldShowUp = await createTestInstitution({
      aggregatorIntegrations: {
        mx: { ...aggregatorIntegration, [aggregatorIntegrationPropKey]: true },
      },
    });

    const institutionThatShouldntShowUp = await createTestInstitution({
      aggregatorIntegrations: {
        mx: aggregatorIntegration,
      },
    });

    const req = buildInstitutionRequest({
      [filterKey]: true,
    });
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse = (res.json as jest.Mock).mock
      .calls[0][0] as PaginatedInstitutionsResponse;
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBe(1);

    expect(jsonResponse.institutions[0].id).toBe(
      institutionThatShouldShowUp.institution.id,
    );

    await institutionThatShouldShowUp.cleanupInstitution();
    await institutionThatShouldntShowUp.cleanupInstitution();
  });
};

describe("getPaginatedInstitutions", () => {
  it("returns a paginated list of institutions", async () => {
    await Institution.truncate({ cascade: true });

    const firstInstitution = await createTestInstitution({
      aggregatorIntegrations: { mx: true },
    });
    const secondInstitution = await createTestInstitution({
      aggregatorIntegrations: { sophtron: true },
    });

    const PAGE_SIZE = 100;
    const CURRENT_PAGE = 1;
    const req = {
      query: {
        page: CURRENT_PAGE,
        pageSize: PAGE_SIZE,
      },
    } as unknown as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPage: CURRENT_PAGE,
        pageSize: PAGE_SIZE,
        totalRecords: expect.any(Number),
        totalPages: expect.any(Number),
        institutions: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            keywords: expect.arrayContaining([expect.any(String)]),
            logo: expect.any(String),
            url: expect.any(String),
            is_test_bank: expect.any(Boolean),
            routing_numbers: expect.arrayContaining([expect.any(String)]),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            aggregatorIntegrations: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                aggregator_institution_id: expect.any(String),
                supports_oauth: expect.any(Boolean),
                supports_identification: expect.any(Boolean),
                supports_verification: expect.any(Boolean),
                supports_aggregation: expect.any(Boolean),
                supports_history: expect.any(Boolean),
                supportsRewards: expect.any(Boolean),
                supportsBalance: expect.any(Boolean),
                isActive: expect.any(Boolean),
                aggregator: expect.objectContaining({
                  name: expect.any(String),
                  id: expect.any(Number),
                  displayName: expect.any(String),
                }),
              }),
            ]),
          }),
        ]),
      }),
    );

    await firstInstitution.cleanupInstitution();
    await secondInstitution.cleanupInstitution();
  });

  it("gets default pagination values when none are passed", async () => {
    const req = {
      query: {},
    } as unknown as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPage: 1,
        pageSize: DEFAULT_PAGINATION_PAGE_SIZE,
        totalRecords: expect.any(Number),
        totalPages: expect.any(Number),
        institutions: expect.arrayContaining([]),
      }),
    );
  });

  describe("individual key filter tests", () => {
    [
      ["supports_oauth", "supportsOauth"],
      ["supports_identification", "supportsIdentification"],
      ["supports_verification", "supportsVerification"],
      ["supports_aggregation", "supportsAggregation"],
      ["supports_history", "supportsHistory"],
      ["supportsRewards", "supportsRewards"],
      ["supportsBalance", "supportsBalance"],
    ].forEach(([aggregatorIntegrationPropKey, filterKey]) => {
      createFilterTest({ aggregatorIntegrationPropKey, filterKey });
    });
  });

  it("filters by search term", async () => {
    await Institution.truncate({ cascade: true });

    const institutionThatShouldShowUp = await createTestInstitution({
      institution: {
        name: "Wells Fargo",
        keywords: [],
      },
      aggregatorIntegrations: { mx: true },
    });

    const institutionThatShouldntShowUp = await createTestInstitution({
      institution: {
        name: "No Fargo",
        keywords: [],
      },
      aggregatorIntegrations: { mx: true },
    });

    const req = buildInstitutionRequest({
      search: "wells",
    });
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const jsonResponse = (res.json as jest.Mock).mock
      .calls[0][0] as PaginatedInstitutionsResponse;
    expect(jsonResponse.totalRecords).toBe(1);

    expect(jsonResponse.institutions[0].id).toBe(
      institutionThatShouldShowUp.institution.id,
    );

    await institutionThatShouldShowUp.cleanupInstitution();
    await institutionThatShouldntShowUp.cleanupInstitution();
  });

  it("filters properly by aggregator", async () => {
    await Institution.truncate({ cascade: true });

    const institutionWithMxAggregator = await createTestInstitution({
      aggregatorIntegrations: { mx: true },
    });

    const institutionWithSophtronAggregator = await createTestInstitution({
      aggregatorIntegrations: { sophtron: true },
    });

    const req = {
      query: {
        aggregatorName: ["mx"],
      },
    } as unknown as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const jsonResponse = (res.json as jest.Mock).mock
      .calls[0][0] as PaginatedInstitutionsResponse;
    expect(jsonResponse.totalRecords).toBe(1);

    expect(jsonResponse.institutions[0].id).toBe(
      institutionWithMxAggregator.institution.id,
    );

    await institutionWithMxAggregator.cleanupInstitution();
    await institutionWithSophtronAggregator.cleanupInstitution();
  });

  it("responds with 500 when there's an error", async () => {
    const req = {
      query: {},
    } as unknown as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    jest.spyOn(Institution, "findAll").mockRejectedValue(new Error());

    await getPaginatedInstitutions(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("gets a list of institutions including mx or finicity integrations", async () => {
    await Institution.truncate({ cascade: true });

    const institutionWithMxAggregator = await createTestInstitution({
      aggregatorIntegrations: { mx: true },
    });

    const institutionWithFinicityAggregator = await createTestInstitution({
      aggregatorIntegrations: { finicity: true },
    });

    const institutionWithSophtronAggregator = await createTestInstitution({
      aggregatorIntegrations: { sophtron: true },
    });

    const req = buildInstitutionRequest({
      aggregatorName: ["mx", "finicity"],
    });
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse = (res.json as jest.Mock).mock
      .calls[0][0] as PaginatedInstitutionsResponse;
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.currentPage).toBe(1);
    expect(jsonResponse.totalRecords).toBe(2);

    const institutionIds = jsonResponse.institutions.map((i) => i.id);
    expect(institutionIds).toContain(
      institutionWithMxAggregator.institution.id,
    );
    expect(institutionIds).toContain(
      institutionWithFinicityAggregator.institution.id,
    );

    await institutionWithMxAggregator.cleanupInstitution();
    await institutionWithFinicityAggregator.cleanupInstitution();
    await institutionWithSophtronAggregator.cleanupInstitution();
  });

  it("gets a list of active institutions with an mx integration and supports_history", async () => {
    const institutionThatShouldShowUp = await createTestInstitution({
      aggregatorIntegrations: {
        mx: {
          isActive: true,
          supports_history: true,
        },
      },
    });

    const institutionThatShouldntShowUp = await createTestInstitution({
      aggregatorIntegrations: {
        mx: {
          isActive: true,
          supports_history: false,
        },
      },
    });

    const req = buildInstitutionRequest({
      aggregatorName: "mx",
      supportsHistory: true,
    });
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse = (res.json as jest.Mock).mock
      .calls[0][0] as PaginatedInstitutionsResponse;
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBe(1);
    expect(jsonResponse.institutions[0].id).toBe(
      institutionThatShouldShowUp.institution.id,
    );

    await institutionThatShouldShowUp.cleanupInstitution();
    await institutionThatShouldntShowUp.cleanupInstitution();
  });

  it("gets a list of active institutions with an mx integration and supports_history and has OAuth", async () => {
    const institutionThatShouldShowUp = await createTestInstitution({
      aggregatorIntegrations: {
        mx: {
          isActive: true,
          supports_history: true,
          supports_oauth: true,
        },
      },
    });

    const institutionThatShouldntShowUp = await createTestInstitution({
      aggregatorIntegrations: {
        sophtron: {
          isActive: true,
          supports_history: true,
          supports_oauth: true,
        },
      },
    });

    const req = buildInstitutionRequest({
      aggregatorName: "mx",
      supportsHistory: true,
    });
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse = (res.json as jest.Mock).mock
      .calls[0][0] as PaginatedInstitutionsResponse;
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBe(1);

    expect(jsonResponse.institutions[0].id).toBe(
      institutionThatShouldShowUp.institution.id,
    );

    await institutionThatShouldShowUp.cleanupInstitution();
    await institutionThatShouldntShowUp.cleanupInstitution();
  });

  it("gets a list of active institutions with mx agg support, supports_history, has OAuth and 'Bank' in the name", async () => {
    const allRequiredProps = {
      isActive: true,
      supports_aggregation: true,
      supports_history: true,
      supports_oauth: true,
    };

    const firstInstitution = await createTestInstitution({
      aggregatorIntegrations: {
        mx: allRequiredProps,
      },
      institution: {
        name: "Banking Institution Test",
      },
    });

    const secondInstitution = await createTestInstitution({
      institution: {
        name: "Another Bank Institution",
      },
      aggregatorIntegrations: {
        mx: { ...allRequiredProps, supports_oauth: false },
      },
    });

    const req = buildInstitutionRequest({
      search: "Bank",
      aggregatorName: "mx",
      supportsHistory: true,
      supportsAggregation: true,
      supportsOauth: true,
    });
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse = (res.json as jest.Mock).mock
      .calls[0][0] as PaginatedInstitutionsResponse;

    expect(jsonResponse.institutions.length).toBe(1);

    expect(jsonResponse.institutions[0].id).toBe(
      firstInstitution.institution.id,
    );

    await firstInstitution.cleanupInstitution();
    await secondInstitution.cleanupInstitution();
  });

  it("gets a list of active institutions with 'Wells' in the name", async () => {
    const firstInstitution = await createTestInstitution({
      institution: {
        name: "Wells Testing Institution",
      },
      aggregatorIntegrations: { mx: true },
    });

    const secondInstitution = await createTestInstitution({
      institution: {
        name: "Not Included Bank",
      },
    });

    const req = buildInstitutionRequest({
      search: "Wells",
    });

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse = (res.json as jest.Mock).mock
      .calls[0][0] as PaginatedInstitutionsResponse;

    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBe(1);
    expect(jsonResponse.institutions[0].id).toBe(
      firstInstitution.institution.id,
    );

    await firstInstitution.cleanupInstitution();
    await secondInstitution.cleanupInstitution();
  });

  it("includes institutions with inactive integrations when includeInactiveIntegrations is passed", async () => {
    await Institution.truncate({ cascade: true });

    const firstInstitution = await createTestInstitution({
      aggregatorIntegrations: {
        mx: { isActive: false },
      },
    });

    const secondInstitution = await createTestInstitution({
      aggregatorIntegrations: {
        mx: { isActive: true },
      },
    });

    const req = buildInstitutionRequest({
      includeInactiveIntegrations: true,
      aggregatorName: ["mx", "sophtron", "finicity"],
    });
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse = (res.json as jest.Mock).mock
      .calls[0][0] as PaginatedInstitutionsResponse;

    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBe(2);

    const institutionIds = jsonResponse.institutions.map((i) => i.id);
    expect(institutionIds).toContain(firstInstitution.institution.id);
    expect(institutionIds).toContain(secondInstitution.institution.id);

    await firstInstitution.cleanupInstitution();
    await secondInstitution.cleanupInstitution();
  });

  it("excludes institutions with inactive integrations when includeInactiveIntegrations is not passed", async () => {
    await Institution.truncate({ cascade: true });

    const firstInstitution = await createTestInstitution({
      aggregatorIntegrations: {
        mx: { isActive: false },
      },
    });

    const secondInstitution = await createTestInstitution({
      aggregatorIntegrations: {
        mx: { isActive: true },
      },
    });

    const req = buildInstitutionRequest({
      aggregatorName: ["mx", "sophtron", "finicity"],
    });
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse = (res.json as jest.Mock).mock
      .calls[0][0] as PaginatedInstitutionsResponse;

    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBe(1);

    expect(jsonResponse.institutions[0].id).toBe(
      secondInstitution.institution.id,
    );

    await firstInstitution.cleanupInstitution();
    await secondInstitution.cleanupInstitution();
  });

  it("uses default sort order if sortBy is not passed in to request", async () => {
    await Institution.truncate({ cascade: true });

    const firstInstitution = await createTestInstitution({
      institution: { name: "B Institution" },
      aggregatorIntegrations: { mx: true },
    });

    const secondInstitution = await createTestInstitution({
      institution: { name: "A Institution" },
      aggregatorIntegrations: { mx: true },
    });

    const thirdInstitution = await createTestInstitution({
      institution: { name: "C Institution" },
      aggregatorIntegrations: { mx: true },
    });

    const req = buildInstitutionRequest({});

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse = (res.json as jest.Mock).mock
      .calls[0][0] as PaginatedInstitutionsResponse;

    expect(
      checkIsSorted(jsonResponse.institutions, "createdAt", "desc"),
    ).toBeTruthy();

    await firstInstitution.cleanupInstitution();
    await secondInstitution.cleanupInstitution();
    await thirdInstitution.cleanupInstitution();
  });

  it("uses custom sort order when sortBy is provided", async () => {
    await Institution.truncate({ cascade: true });

    const firstInstitution = await createTestInstitution({
      institution: { name: "B Institution" },
      aggregatorIntegrations: { mx: true },
    });

    const secondInstitution = await createTestInstitution({
      institution: { name: "A Institution" },
      aggregatorIntegrations: { mx: true },
    });

    const thirdInstitution = await createTestInstitution({
      institution: { name: "C Institution" },
      aggregatorIntegrations: { mx: true },
    });

    const sortBy = "id:asc";

    const req = buildInstitutionRequest({
      sortBy,
    });

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse = (res.json as jest.Mock).mock
      .calls[0][0] as PaginatedInstitutionsResponse;

    expect(checkIsSorted(jsonResponse.institutions, "id", "asc")).toBeTruthy();

    await firstInstitution.cleanupInstitution();
    await secondInstitution.cleanupInstitution();
    await thirdInstitution.cleanupInstitution();
  });
});
