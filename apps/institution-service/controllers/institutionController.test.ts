import { Request, Response } from "express";
import { Institution } from "../models/institution";
import {
  seedInstitutionId,
  seedInstitutionName,
  testInstitution,
} from "../test/testData/institutions";
import {
  createInstitution,
  deleteInstitution,
  getAllInstitutions,
  getInstitutionById,
} from "./institutionController";

describe("institutionController", () => {
  describe("getAllInstitutions", () => {
    it("returns all institutions", async () => {
      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getAllInstitutions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).not.toHaveProperty("error");
    });
  });

  describe("getInstitutionById", () => {
    it("finds institution from the database seed", async () => {
      const req: Request = {
        params: {
          id: seedInstitutionId,
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getInstitutionById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        await Institution.findByPk(seedInstitutionId, {
          include: [Institution.associations.providers],
        })
      );
    });

    it("returns 404 not found when ID is invalid", async () => {
      const req: Request = {
        params: {
          id: "junk",
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getInstitutionById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Institution not found",
      });
    });
  });

  describe("createInstitution", () => {
    it("creates a new institution with valid params", async () => {
      const randomString = Math.random().toString(36).slice(2, 9);
      const newInstitutionId = `UCP-${randomString}`;

      const req: Request = {
        body: {
          ...testInstitution,
          ucp_id: newInstitutionId,
          name: `createTest-${randomString}`,
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const institution = await Institution.findByPk(newInstitutionId);
      expect(institution?.ucp_id).toBe(newInstitutionId);

      // db cleanup
      institution?.destroy();
    });

    it("response with an error when a required field is missing", async () => {
      const req: Request = {
        body: {
          ...testInstitution,
          ucp_id: undefined,
          name: "createTest",
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      // Later on we should add validation to have more descriptive errors
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });

    it("response with an error when an institution with that ucp_id already exists", async () => {
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

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid Institution Data",
        message: "ucp_id must be unique",
      });
    });

    it("response with success when an institution with the same name already exists", async () => {
      const randomString = Math.random().toString(36).slice(2, 9);
      const newInstitutionId = `UCP-${randomString}`;

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

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("deleteInstitution", () => {
    it("deletes an institution from the database", async () => {
      const randomString = Math.random().toString(36).slice(2, 9);
      const newInstitutionId = `UCP-${randomString}`;

      await Institution.create({
        ...testInstitution,
        ucp_id: newInstitutionId,
        name: newInstitutionId,
      });

      const req: Request = {
        params: {
          id: newInstitutionId,
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await deleteInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({ message: "Institution deleted" });
    });
  });

  describe("deleteInstitution", () => {
    it("deletes an institution from the database", async () => {
      const req: Request = {
        params: {
          id: "junk",
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await deleteInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Failure to delete" });
    });
  });
});
