/* eslint-disable @typescript-eslint/unbound-method */
import { Request, Response } from "express";
import { getPaginatedInstitutions } from "../controllers/institutionController";

const buildInstitutionRequest = ({
  search,
  page,
  pageSize,
  aggregatorName,
  supportsIdentification,
  supportsAggregation,
  supportsHistory,
  supportsVerification,
  supportsOauth,
  includeInactiveIntegrations,
}: {
  search?: string;
  page?: number;
  pageSize?: number;
  aggregatorName?: string[] | string;
  supportsIdentification?: boolean;
  supportsAggregation?: boolean;
  supportsHistory?: boolean;
  supportsVerification?: boolean;
  supportsOauth?: boolean;
  includeInactiveIntegrations?: boolean;
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
      supportsVerification: supportsVerification ? "true" : undefined,
      supportsOauth: supportsOauth ? "true" : undefined,
      includeInactiveIntegrations: includeInactiveIntegrations
        ? "true"
        : undefined,
    },
  } as unknown as Request;
};

interface PaginatedInstitutionResponse {
  currentPage: number;
  totalRecords: number;
  institutions: [
    {
      name: string;
      aggregatorIntegrations: [
        {
          isActive: boolean;
          supports_aggregation: boolean;
          supports_identification: boolean;
          supports_verification: boolean;
          supports_history: boolean;
          supports_oauth: boolean;
          aggregator: {
            name: string;
          };
        },
      ];
    },
  ];
}

describe("get institutions with filters and search", () => {
  it("gets a list of institutions including mx or finicity integrations", async () => {
    const req = buildInstitutionRequest({
      aggregatorName: ["mx", "finicity"],
    });
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (res.json as jest.Mock).mock.calls[0][0] as PaginatedInstitutionResponse;
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.currentPage).toBe(1);
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);
    jsonResponse.institutions.forEach((institution) => {
      let mxFound = false;
      let finicityFound = false;
      institution.aggregatorIntegrations.forEach((integration) => {
        if (integration.aggregator.name === "mx") {
          mxFound = true;
        } else if (integration.aggregator.name === "finicity") {
          finicityFound = true;
        }
      });
      expect(mxFound || finicityFound).toBeTruthy();
    });
  });

  it("gets a list of institutions that have an integration that supports filtered job types", async () => {
    const req = buildInstitutionRequest({
      supportsIdentification: true,
      supportsVerification: true,
      supportsAggregation: true,
      supportsHistory: true,
    });
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (res.json as jest.Mock).mock.calls[0][0] as PaginatedInstitutionResponse;
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);
    jsonResponse.institutions.forEach((institution) => {
      let jobTypesSupported = false;
      institution.aggregatorIntegrations.forEach((aggInt) => {
        if (
          aggInt.supports_aggregation &&
          aggInt.supports_identification &&
          aggInt.supports_verification &&
          aggInt.supports_history
        ) {
          jobTypesSupported = true;
        }
      });
      expect(jobTypesSupported).toBeTruthy();
    });
  });

  it("institution list by default only includes institutions which have at least one active integration", async () => {
    const req = buildInstitutionRequest({});
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (res.json as jest.Mock).mock.calls[0][0] as PaginatedInstitutionResponse;
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);
    jsonResponse.institutions.forEach((institution) => {
      let hasActiveIntegration = false;
      institution.aggregatorIntegrations.forEach((aggInt) => {
        if (aggInt.isActive) {
          hasActiveIntegration = true;
        }
      });
      expect(hasActiveIntegration).toBeTruthy();
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

    const jsonResponse =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (res.json as jest.Mock).mock.calls[0][0] as PaginatedInstitutionResponse;
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);
    jsonResponse.institutions.forEach((institution) => {
      let hasExpectedAttributes = false;
      institution.aggregatorIntegrations.forEach((aggInt) => {
        if (aggInt.aggregator.name === "mx") {
          hasExpectedAttributes = aggInt.isActive && aggInt.supports_history;
        }
      });
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

    const jsonResponse =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (res.json as jest.Mock).mock.calls[0][0] as PaginatedInstitutionResponse;
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);
    jsonResponse.institutions.forEach((institution) => {
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

    const jsonResponse =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (res.json as jest.Mock).mock.calls[0][0] as PaginatedInstitutionResponse;
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

    const jsonResponse =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (res.json as jest.Mock).mock.calls[0][0] as PaginatedInstitutionResponse;

    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);
    jsonResponse.institutions.forEach((institution) => {
      expect(institution.name.toLowerCase().includes("wells")).toBeTruthy();
    });
  });

  it("includes institutions with inactive integrations when includeInactiveIntegrations is passed", async () => {
    const req = buildInstitutionRequest({
      includeInactiveIntegrations: true,
    });
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (res.json as jest.Mock).mock.calls[0][0] as PaginatedInstitutionResponse;

    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);
    let inactiveInstitutionFound = false;
    jsonResponse.institutions.forEach((institution) => {
      let activeAggregatorFound = false;
      institution.aggregatorIntegrations.forEach((aggInt) => {
        if (aggInt.isActive) {
          activeAggregatorFound = true;
        }
      });
      if (!activeAggregatorFound) {
        inactiveInstitutionFound = true;
      }
    });
    expect(inactiveInstitutionFound).toBeTruthy();
  });

  it("exludes institutions with inactive integrations when includeInactiveIntegrations is not passed", async () => {
    const req = buildInstitutionRequest({});
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getPaginatedInstitutions(req, res);

    const jsonResponse =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (res.json as jest.Mock).mock.calls[0][0] as PaginatedInstitutionResponse;

    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse.totalRecords).toBeGreaterThan(0);
    let inactiveInstitutionFound = false;
    jsonResponse.institutions.forEach((institution) => {
      let activeAggregatorFound = false;
      institution.aggregatorIntegrations.forEach((aggInt) => {
        if (aggInt.isActive) {
          activeAggregatorFound = true;
        }
      });
      if (!activeAggregatorFound) {
        inactiveInstitutionFound = true;
      }
    });
    expect(inactiveInstitutionFound).toBeFalsy();
  });
});
