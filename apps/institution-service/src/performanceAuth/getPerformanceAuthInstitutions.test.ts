/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Request, Response } from "express";
import { getPerformanceAuthInstitutions } from "./getPerformanceAuthInstitutions";
import { InstitutionDetail } from "../institutions/consts";
import { Institution } from "../models/institution";

const uniqueKeywordString = "unique";
const testInstitutionName = "Delete this";

describe("getPerformanceAuthInstitutions", () => {
  let idToDelete: string;

  beforeAll(async () => {
    const institution = await Institution.create({
      name: testInstitutionName,
      keywords: [uniqueKeywordString],
      logo: "https://example.com/logo.png",
      url: "https://unique.com",
      is_test_bank: true,
      routing_numbers: ["123456789"],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    idToDelete = institution.id as string;
  });

  afterAll(async () => {
    await Institution.destroy({ where: { id: idToDelete } });
  });

  it("should return institutions with pagination and sorting", async () => {
    const req = {
      query: {
        page: 2,
        sortBy: "name:DESC",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getPerformanceAuthInstitutions(req, res);

    const firstCall = (res.json as jest.Mock).mock.calls[0][0];

    const institutions = firstCall?.institutions as InstitutionDetail[];

    for (let i = 0; i < institutions.length - 1; i++) {
      expect(institutions[i].name >= institutions[i + 1].name).toBeTruthy();
    }

    expect(firstCall.currentPage).toBe(2);
    expect(firstCall.pageSize).toBeDefined();
    expect(firstCall.totalRecords).toBeDefined();
    expect(firstCall.totalPages).toBeDefined();
  });

  it("searches for institutions by keyword", async () => {
    const req = {
      query: {
        search: uniqueKeywordString,
        sortBy: "name:DESC",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getPerformanceAuthInstitutions(req, res);

    const firstCall = (res.json as jest.Mock).mock.calls[0][0];

    const institutions = firstCall?.institutions as InstitutionDetail[];

    expect(institutions).toBeDefined();
    expect(institutions.length).toBeGreaterThan(0);
    expect(
      institutions.find(({ name }) => name.includes(testInstitutionName)),
    ).toBeDefined();
  });

  it("searches for institutions by name", async () => {
    const req = {
      query: {
        search: "delete",
        sortBy: "name:DESC",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getPerformanceAuthInstitutions(req, res);

    const firstCall = (res.json as jest.Mock).mock.calls[0][0];

    const institutions = firstCall?.institutions as InstitutionDetail[];

    expect(institutions).toBeDefined();
    expect(institutions.length).toBeGreaterThan(0);
    expect(
      institutions.find(({ name }) => name.includes(testInstitutionName)),
    ).toBeDefined();
  });

  it("defaults to sorting by name in ascending order", async () => {
    const req = {
      query: {
        page: 1,
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getPerformanceAuthInstitutions(req, res);

    const firstCall = (res.json as jest.Mock).mock.calls[0][0];

    const institutions = firstCall?.institutions as InstitutionDetail[];

    for (let i = 0; i < institutions.length - 1; i++) {
      expect(institutions[i].name <= institutions[i + 1].name).toBeTruthy();
    }
  });
});
