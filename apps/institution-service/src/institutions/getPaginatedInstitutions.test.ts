/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Request, Response } from "express";
import { getPaginatedInstitutions } from "./getPaginatedInstitutions";
import { DEFAULT_PAGINATION_PAGE_SIZE } from "../shared/const";
import { seedInstitutionId } from "../test/testData/institutions";
import { Institution } from "../models/institution";
import { checkIsSorted } from "../test/checkIsSorted";
import { PaginatedInstitutionsResponse } from "./consts";

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

describe("getPaginatedInstitutions", () => {
  it("returns a paginated list of institutions", async () => {
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

  it("returns correct items from search term", async () => {
    const req = {
      query: {
        search: "wells",
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
        totalRecords: 1,
        totalPages: expect.any(Number),
        institutions: expect.arrayContaining([
          expect.objectContaining({
            id: seedInstitutionId,
            name: "Wells Fargo",
          }),
        ]),
      }),
    );
  });

  [
    "isActive",
    "supports_oauth",
    "supports_identification",
    "supports_verification",
    "supports_aggregation",
    "supports_history",
    "supportsRewards",
    "supportsBalance",
  ].forEach((keyword) => {
    const req = {
      query: {
        [keyword]: "true",
      },
    } as unknown as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    it(`returns expected response with filter: ${keyword} = true`, async () => {
      await getPaginatedInstitutions(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          institutions: expect.arrayContaining([
            expect.objectContaining({
              aggregatorIntegrations: expect.arrayContaining([
                expect.objectContaining({
                  [keyword]: true,
                }),
              ]),
            }),
          ]),
        }),
      );
    });
  });

  it("hides institutions that don't have aggregator integrations", async () => {
    const req = {
      query: {
        search: "No aggregator integrations",
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
        totalRecords: 0,
        institutions: [],
      }),
    );
  });

  it("shows institutions that don't have aggregator integrations if includeInactiveIntegrations", async () => {
    const req = {
      query: {
        includeInactiveIntegrations: "true",
        search: "No aggregator integrations",
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
        totalRecords: 1,
        institutions: expect.arrayContaining([
          expect.objectContaining({
            aggregatorIntegrations: [],
          }),
        ]),
      }),
    );
  });

  it("filters properly by aggregator", async () => {
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
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        institutions: expect.arrayContaining([
          expect.objectContaining({
            aggregatorIntegrations: expect.arrayContaining([
              expect.objectContaining({
                aggregator: expect.objectContaining({ name: "mx" }),
              }),
            ]),
          }),
        ]),
      }),
    );
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
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);
    jsonResponse.institutions.forEach((institution) => {
      const hasRequiredAggregator = institution.aggregatorIntegrations.some(
        (integration) =>
          integration.aggregator.name === "mx" ||
          integration.aggregator.name === "finicity",
      );

      expect(hasRequiredAggregator).toBeTruthy();
    });
  });

  it("gets a list of institutions that have an integration that supports filtered job types", async () => {
    const req = buildInstitutionRequest({
      supportsIdentification: true,
      supportsVerification: true,
      supportsAggregation: true,
      supportsHistory: true,
      supportsRewards: true,
      supportsBalance: true,
    });
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse = (res.json as jest.Mock).mock
      .calls[0][0] as PaginatedInstitutionsResponse;
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);
    jsonResponse.institutions.forEach((institution) => {
      const jobTypesSupported = institution.aggregatorIntegrations.some(
        (aggInt) =>
          aggInt.supports_aggregation &&
          aggInt.supports_identification &&
          aggInt.supports_verification &&
          aggInt.supportsRewards &&
          aggInt.supportsBalance &&
          aggInt.supports_history,
      );

      expect(jobTypesSupported).toBeTruthy();
    });
  });

  it("gets a list of active institutions with an mx integration and supports_history", async () => {
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
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);
    jsonResponse.institutions.forEach((institution) => {
      const hasExpectedAttributes = institution.aggregatorIntegrations.some(
        (aggInt) =>
          aggInt.aggregator.name === "mx" &&
          aggInt.isActive &&
          aggInt.supports_history,
      );

      expect(hasExpectedAttributes).toBeTruthy();
    });
  });

  it("gets a list of active institutions with an mx integration and supports_history and has OAuth", async () => {
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
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);

    jsonResponse.institutions.forEach((institution) => {
      const hasExpectedAttributes = institution.aggregatorIntegrations.some(
        (aggInt) =>
          aggInt.aggregator.name === "mx" &&
          aggInt.isActive &&
          aggInt.supports_history &&
          aggInt.supports_oauth,
      );

      expect(hasExpectedAttributes).toBeTruthy();
    });
  });

  it("gets a list of active institutions with mx agg support, supports_history, has OAuth and 'Bank' in the name", async () => {
    const req = buildInstitutionRequest({
      search: "Bank",
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
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);
    jsonResponse.institutions.forEach((institution) => {
      expect(institution.name.includes("Bank")).toBeTruthy();
      let hasExpectedAttributes = false;
      institution.aggregatorIntegrations.forEach((aggInt) => {
        if (aggInt.aggregator.name === "mx") {
          hasExpectedAttributes =
            aggInt.isActive && aggInt.supports_history && aggInt.supports_oauth;
        }
      });
      expect(hasExpectedAttributes).toBeTruthy();
    });
  });

  it("gets a list of active institutions with 'Wells' in the name", async () => {
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
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);
    jsonResponse.institutions.forEach((institution) => {
      expect(institution.name.toLowerCase().includes("wells")).toBeTruthy();
    });
  });

  it("includes institutions with inactive integrations when includeInactiveIntegrations is passed", async () => {
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
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);

    const inactiveInstitutionFound = jsonResponse.institutions.some(
      (institution) => {
        const activeAggregatorFound = institution.aggregatorIntegrations.some(
          (aggInt) => aggInt.isActive,
        );
        return !activeAggregatorFound;
      },
    );

    expect(inactiveInstitutionFound).toBeTruthy();
  });

  it("excludes institutions with inactive integrations when includeInactiveIntegrations is not passed", async () => {
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
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);

    const inactiveInstitutionFound = jsonResponse.institutions.some(
      (institution) => {
        const activeAggregatorFound = institution.aggregatorIntegrations.some(
          (aggInt) => aggInt.isActive,
        );
        return !activeAggregatorFound;
      },
    );

    expect(inactiveInstitutionFound).toBeFalsy();
  });

  it("uses default sort order if sortBy is not passed in to request", async () => {
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
  });

  it("uses custom sort order when sortBy is provided", async () => {
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
  });
});
