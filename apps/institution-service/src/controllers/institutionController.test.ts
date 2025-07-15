/* eslint-disable @typescript-eslint/unbound-method */
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
});
