/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { UUID } from "crypto";
import { Request, Response } from "express";
import { Model } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { Institution } from "../models/institution";
import {
  cachedInstitutionFromSeed,
  seedInstitutionId,
  seedInstitutionName,
  testInstitution,
} from "../test/testData/institutions";
import {
  createInstitution,
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
        expect.objectContaining(institutionBody),
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
    beforeEach(() => {
      jest.restoreAllMocks();
    });

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
        error: "Invalid institution Id",
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
      const OFFSET = (CURRENT_PAGE - 1) * PAGE_SIZE;
      const req = {} as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        locals: {
          pagination: {
            limit: PAGE_SIZE,
            offset: OFFSET,
            page: CURRENT_PAGE,
          },
        },
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

    it("responds with 500 when there's an error", async () => {
      const req = {} as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        locals: {
          // missing pagination will trigger an error
        },
      } as unknown as Response;

      await getPaginatedInstitutions(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
