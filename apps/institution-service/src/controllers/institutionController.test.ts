/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { UUID } from "crypto";
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining(cachedInstitutionFromSeed),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((res.json as jest.Mock).mock.calls[0]?.[0]).toHaveLength(1);
    });

    it("returns 404 on error", async () => {
      jest.spyOn(Institution, "findAll").mockRejectedValue(new Error());

      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getInstitutionCachedList(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
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
      // eslint-disable-next-line @typescript-eslint/unbound-method
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
      // eslint-disable-next-line @typescript-eslint/unbound-method
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
      // eslint-disable-next-line @typescript-eslint/unbound-method
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "An error occurred while updating the institution",
      });
    });
  });

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

      // eslint-disable-next-line @typescript-eslint/unbound-method
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
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

    it("responds with 500 when there's an error", async () => {
      const req = {} as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      jest.spyOn(Institution, "findAndCountAll").mockRejectedValue(new Error());

      await getPaginatedInstitutions(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(500);
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
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
            canEditInstitution: expect.any(Boolean),
          }),
        }),
      );

      const aggregatorIntegrationPermissionsMap =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (res.json as jest.Mock).mock.calls[0]?.[0]?.permissions
          ?.aggregatorIntegrationPermissionsMap;

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

      // eslint-disable-next-line @typescript-eslint/unbound-method
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Institution not found",
      });
    });
  });
});
