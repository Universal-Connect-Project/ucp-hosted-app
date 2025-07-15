/* eslint-disable @typescript-eslint/unbound-method */
import { UUID } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { testInstitution } from "../test/testData/institutions";
import { Institution } from "../models/institution";
import { deleteInstitution } from "./deleteInstitution";
import { Request, Response } from "express";

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
