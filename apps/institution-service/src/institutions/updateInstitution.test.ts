/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Request, Response } from "express";
import { updateInstitution } from "./updateInstitution";
import { Institution } from "../models/institution";
import {
  seedInstitutionId,
  testInstitution,
} from "../test/testData/institutions";
import { Model } from "sequelize";
import {
  getCachedInstitutionList,
  getInstitutionCacheStatus,
} from "../services/institutionCacheManager";

const createNewInstitution = async () => {
  return await Institution.create(testInstitution);
};

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

  it("clears the institution cache when updating an institution", async () => {
    await getCachedInstitutionList();

    const cacheStatusBefore = getInstitutionCacheStatus();
    expect(cacheStatusBefore.exists).toBe(true);
    expect(cacheStatusBefore.valid).toBe(true);

    const institution = await createNewInstitution();
    const existingInstitutionId = institution.id;

    const updateBody = {
      name: "Updated Name for Cache Test",
      keywords: ["updated", "cache"],
      logo: "updatedLogo",
      url: "updatedUrl",
      is_test_bank: true,
      routing_numbers: ["987654321"],
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

    const cacheStatusAfter = getInstitutionCacheStatus();
    expect(cacheStatusAfter.exists).toBe(false);
  });

  it("does not clear cache when update fails", async () => {
    await getCachedInstitutionList();

    const cacheStatusBefore = getInstitutionCacheStatus();
    expect(cacheStatusBefore.exists).toBe(true);
    expect(cacheStatusBefore.valid).toBe(true);

    const req = {
      params: { id: seedInstitutionId },
      body: {},
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    jest.spyOn(Institution, "findByPk").mockResolvedValue({
      update: jest.fn().mockRejectedValue(new Error("Update failed")),
    } as unknown as Model);

    await updateInstitution(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    const cacheStatusAfter = getInstitutionCacheStatus();
    expect(cacheStatusAfter.exists).toBe(true);
    expect(cacheStatusAfter.valid).toBe(true);
  });
});
