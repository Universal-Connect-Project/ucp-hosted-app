/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { UUID } from "crypto";
import { v4 as uuidv4 } from "uuid";
import {
  seedInstitutionName,
  testInstitution,
} from "../test/testData/institutions";
import { createInstitution } from "./createInstitution";
import { Request, Response } from "express";

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
