import { Request, Response } from "express";
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
} from "./institutionController";

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
      jest.spyOn(Institution, "findAll").mockImplementation(() => {
        throw new Error();
      });

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
      const randomString = Math.random().toString(36).slice(2, 9);
      const newInstitutionId = `UCP-${randomString}`;

      const institutionBody = {
        ...testInstitution,
        ucp_id: newInstitutionId,
        name: `createTest-${randomString}`,
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
          ucp_id: undefined,
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
      const randomString = Math.random().toString(36).slice(1, 9);
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});
