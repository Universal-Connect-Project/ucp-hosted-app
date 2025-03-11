/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { UUID } from "crypto";
import { checkIsSorted } from "../test/utils";
import { Request, Response } from "express";
import { Model } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { Institution } from "../models/institution";
import { DEFAULT_PAGINATION_PAGE_SIZE } from "../shared/const";
import {
  cachedInstitutionFromSeed,
  seedInstitutionId,
  seedInstitutionName,
  testInstitution,
} from "../test/testData/institutions";
import { createTestAuthorization } from "../test/utils";
import {
  createInstitution,
  deleteInstitution,
  getInstitution,
  getInstitutionCachedList,
  getPaginatedInstitutions,
  updateInstitution,
} from "./institutionController";

const createNewInstitution = async () => {
  return await Institution.create(testInstitution);
};

describe("institutionController", () => {
  describe("getInstitutionCachedList", () => {
    it("returns all institutions in the cached format, doesn't return aggregator connections that aren't active, and filters out institutions that don't have any aggregator connections", async () => {
      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getInstitutionCachedList(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining(cachedInstitutionFromSeed),
        ]),
      );
    });

    it("returns 404 on error", async () => {
      jest.spyOn(Institution, "findAll").mockRejectedValue(new Error());

      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getInstitutionCachedList(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error getting all Institutions",
      });
    });
  });

  describe("createInstitution", () => {
    it("creates a new institution with valid params", async () => {
      const newInstitutionId = uuidv4() as UUID;

      const institutionBody = {
        ...testInstitution,
        name: `createTest-${newInstitutionId}`,
      };

      const req: Request = {
        body: institutionBody,
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          institution: expect.objectContaining(institutionBody),
        }),
      );
    });

    it("responds with an error when a required field is missing", async () => {
      const req: Request = {
        body: {
          ...testInstitution,
          name: undefined,
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("responds with success when an institution with the same name already exists", async () => {
      const req: Request = {
        body: {
          ...testInstitution,
          name: seedInstitutionName,
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("updateInstitution", () => {
    it("responds with 404 when institutionId is invalid", async () => {
      const invalidInstitutionId = "invalidInstitutionId";
      const req = {
        params: { id: invalidInstitutionId },
        body: { name: "newName" },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await updateInstitution(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Institution not found",
      });
    });

    it("responds with 404 when institution is not found", async () => {
      const nonExistentInstitutionId = "b2c01271-10e3-4f24-9236-44719e41fb40";
      const req = {
        params: { id: nonExistentInstitutionId },
        body: { name: "newName" },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await updateInstitution(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Institution not found",
      });
    });

    it("responds with 200 when institution exists and attributes are valid", async () => {
      const institution = await createNewInstitution();
      const existingInstitutionId = institution.id;

      const updateBody = {
        name: "newName",
        keywords: ["newKeywords"],
        logo: "newLogo",
        url: "newUrl",
        is_test_bank: true,
        routing_numbers: ["123456789"],
      };

      const req = {
        params: { id: existingInstitutionId },
        body: updateBody,
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await updateInstitution(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Institution updated successfully",
        institution: expect.objectContaining({
          ...updateBody,
          id: existingInstitutionId,
        }),
      });
    });

    it("responds with 500 when there's an error updating the institution", async () => {
      const req = {
        params: { id: seedInstitutionId },
        body: {},
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      jest.spyOn(Institution, "findByPk").mockResolvedValue({
        update: jest.fn().mockRejectedValue(new Error("Server broke")),
      } as unknown as Model);

      await updateInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "An error occurred while updating the institution",
      });
    });
  });

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
            supportsRewards: boolean;
            supportsBalance: boolean;
            supports_oauth: boolean;
            aggregator: {
              name: string;
            };
          },
        ];
      },
    ];
  }

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
        .calls[0][0] as PaginatedInstitutionResponse;
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
        .calls[0][0] as PaginatedInstitutionResponse;
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
        .calls[0][0] as PaginatedInstitutionResponse;
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
        .calls[0][0] as PaginatedInstitutionResponse;
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
        .calls[0][0] as PaginatedInstitutionResponse;
      expect(res.status).toHaveBeenCalledWith(200);
      expect(jsonResponse.totalRecords).toBeGreaterThan(0);
      jsonResponse.institutions.forEach((institution) => {
        expect(institution.name.includes("Bank")).toBeTruthy();
        let hasExpectedAttributes = false;
        institution.aggregatorIntegrations.forEach((aggInt) => {
          if (aggInt.aggregator.name === "mx") {
            hasExpectedAttributes =
              aggInt.isActive &&
              aggInt.supports_history &&
              aggInt.supports_oauth;
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
        .calls[0][0] as PaginatedInstitutionResponse;

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
        .calls[0][0] as PaginatedInstitutionResponse;

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
        .calls[0][0] as PaginatedInstitutionResponse;

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
        .calls[0][0] as PaginatedInstitutionResponse;

      expect(
        checkIsSorted(jsonResponse.institutions, "createdAt", "desc"),
      ).toBeTruthy();
    });

    it("uses custom sort order when sortBy is provided", async () => {
      const sortBy = "id";

      const req = buildInstitutionRequest({
        sortBy,
      });

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getPaginatedInstitutions(req, res);

      const jsonResponse = (res.json as jest.Mock).mock
        .calls[0][0] as PaginatedInstitutionResponse;

      expect(
        checkIsSorted(jsonResponse.institutions, "id", "asc"),
      ).toBeTruthy();
    });
  });

  describe("getInstitution", () => {
    it("responds with an institution and has the expected attributes", async () => {
      const req = {
        headers: {
          authorization: createTestAuthorization({
            permissions: [],
          }),
        },
        params: { id: seedInstitutionId },
      } as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          institution: expect.objectContaining({
            id: seedInstitutionId,
            name: "Wells Fargo",
            keywords: ["wells", "fargo"],
            logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867_100x100.png",
            url: "https://wellsfargo.com",
            is_test_bank: false,
            routing_numbers: ["111111111"],
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
                  logo: "https://logo.com",
                }),
              }),
            ]),
          }),
          permissions: expect.objectContaining({
            aggregatorIntegrationPermissionsMap: expect.any(Object),
            aggregatorsThatCanBeAdded: [],
            canDeleteInstitution: expect.any(Boolean),
            canEditInstitution: expect.any(Boolean),
          }),
        }),
      );

      const aggregatorIntegrationPermissionsMap = (res.json as jest.Mock).mock
        .calls[0]?.[0]?.permissions?.aggregatorIntegrationPermissionsMap;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(Object.values(aggregatorIntegrationPermissionsMap)[0]).toEqual(
        expect.objectContaining({
          canDelete: expect.any(Boolean),
          canEdit: expect.any(Boolean),
        }),
      );
    });

    it("responds with 404 when id param is invalid", async () => {
      const req = {
        params: { id: "123" },
      } as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Institution not found",
      });
    });

    it("responds with 404 when id param is valid but not belonging to an institution", async () => {
      const req = {
        params: { id: "ee6d71dc-e693-4fc3-a775-53c378bc5066" },
      } as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Institution not found",
      });
    });
  });

  describe("deleteInstitution", () => {
    it("removes the institution and responds with a 204 on success", async () => {
      const newInstitutionId = uuidv4() as UUID;

      const institutionBody = {
        ...testInstitution,
        id: newInstitutionId,
        name: `deleteTest-${newInstitutionId}`,
      };

      await Institution.create(institutionBody);

      expect(await Institution.findByPk(newInstitutionId)).not.toBe(null);

      const req = {
        params: { id: newInstitutionId },
      } as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await deleteInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(204);

      expect(await Institution.findByPk(newInstitutionId)).toBe(null);
    });

    it("fails with a 404 if the institution doesn't exist", async () => {
      const req = {
        params: { id: "ee6d71dc-aaaa-4fc3-a775-53c378bc5066" },
      } as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await deleteInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Institution not found",
      });
    });

    it("fails with a 500 if an unexpected error occurs", async () => {
      jest.spyOn(Institution, "findByPk").mockImplementation(() => {
        throw new Error();
      });

      const req = {
        params: { id: "ee6d71dc-aaaa-4fc3-a775-53c378bc5066" },
      } as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await deleteInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "An error occurred while deleting the institution",
      });
    });
  });
});
