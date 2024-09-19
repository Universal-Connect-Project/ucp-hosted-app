import { Request, Response } from "express";
import { Model } from "sequelize";
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
  updateInstitution,
} from "./institutionController";
import { randomUUID } from "crypto";

const createNewInstitution = async () => {
  const newInstitutionId = randomUUID();
  return await Institution.create({
    ...testInstitution,
    ucp_id: newInstitutionId,
  });
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
      const newInstitutionId = randomUUID();

      const institutionBody = {
        ...testInstitution,
        ucp_id: newInstitutionId,
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

    it("creates a new institution with valid params", async () => {
      const newInstitutionId = randomUUID();

      const institutionBody = {
        ...testInstitution,
        ucp_id: newInstitutionId,
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

    it("creates a new institution if no ucp_id is provided", async () => {
      const newInstitutionId = randomUUID();

      const institutionBody = {
        ...testInstitution,
        ucp_id: undefined,
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

      const institutionResult = {
        ...institutionBody,
      };

      delete institutionResult.ucp_id;

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining(institutionResult),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((res.json as jest.Mock).mock.calls[0][0].ucp_id).toBeTruthy();
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

    it("responds with an error when an institution with that ucp_id already exists", async () => {
      const req: Request = {
        body: {
          ...testInstitution,
          ucp_id: seedInstitutionId,
          name: "createTest",
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createInstitution(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid Institution Data",
        message: "ucp_id must be unique",
      });
    });

    it("responds with success when an institution with the same name already exists", async () => {
      const newInstitutionId = randomUUID();

      const req: Request = {
        body: {
          ...testInstitution,
          ucp_id: newInstitutionId,
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

    it("responds with 404 when institution is not found", async () => {
      const nonExistentInstitutionId = "nonExistentInstitutionId";
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
      const existingUcpId = institution.ucp_id;

      const updateBody = {
        name: "newName",
        keywords: "newKeywords",
        logo: "newLogo",
        url: "newUrl",
        is_test_bank: true,
        routing_numbers: ["123456789"],
      };

      const req = {
        params: { id: existingUcpId },
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        institution: expect.objectContaining({
          ...updateBody,
          ucp_id: existingUcpId,
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
});
