/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import { getPaginatedAggregatorInstitutionsHandler } from "./getPaginatedAggregatorInstitutionsHandler";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { Institution } from "../models/institution";
import { createTestInstitution } from "../test/createTestInstitution";

const expectInstitution = (institution: AggregatorInstitution) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  expect.objectContaining({
    id: institution.id,
    name: institution.name,
    createdAt: institution.createdAt,
    updatedAt: institution.updatedAt,
    supportsAccountOwner: institution.supportsAccountOwner,
    supportsAccountNumber: institution.supportsAccountNumber,
    supportsBalance: institution.supportsBalance,
    supportsOAuth: institution.supportsOAuth,
    supportsRewards: institution.supportsRewards,
    supportsTransactions: institution.supportsTransactions,
    supportsTransactionHistory: institution.supportsTransactionHistory,
    url: institution.url,
  });

describe("getPaginatedAggregatorInstitutionsHandler", () => {
  let finicityAggregatorId: number;
  let mxAggregatorId: number;
  let sophtronAggregatorId: number;

  beforeEach(async () => {
    await AggregatorInstitution.destroy({ where: {}, force: true });
    await AggregatorIntegration.destroy({ where: {}, force: true });
    await Institution.truncate({ cascade: true });

    finicityAggregatorId = (await getAggregatorByName("finicity")).id;
    mxAggregatorId = (await getAggregatorByName("mx")).id;
    sophtronAggregatorId = (await getAggregatorByName("sophtron")).id;
  });

  it("paginates", async () => {
    const firstInstitution = await AggregatorInstitution.create({
      aggregatorId: finicityAggregatorId,
      id: "aggregatorInstitution1",
      name: "Test Aggregator Institution 1",
      url: "https://test-aggregator1.com",
    });

    const secondInstitution = await AggregatorInstitution.create({
      aggregatorId: finicityAggregatorId,
      id: "aggregatorInstitution2",
      name: "Test Aggregator Institution 2",
      url: "https://test-aggregator2.com",
    });

    const res = {
      json: jest.fn(),
    } as unknown as Response;

    let req = {
      query: { page: "1", pageSize: "1" },
    } as unknown as Request;

    await getPaginatedAggregatorInstitutionsHandler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPage: 1,
        pageSize: 1,
        totalRecords: 2,
        totalPages: 2,
        aggregatorInstitutions: expect.arrayContaining([
          expect.objectContaining({
            id: firstInstitution.id,
            name: firstInstitution.name,
            createdAt: firstInstitution.createdAt,
            updatedAt: firstInstitution.updatedAt,
            supportsAccountOwner: firstInstitution.supportsAccountOwner,
            supportsAccountNumber: firstInstitution.supportsAccountNumber,
            supportsBalance: firstInstitution.supportsBalance,
            supportsOAuth: firstInstitution.supportsOAuth,
            supportsRewards: firstInstitution.supportsRewards,
            supportsTransactions: firstInstitution.supportsTransactions,
            supportsTransactionHistory:
              firstInstitution.supportsTransactionHistory,
            url: firstInstitution.url,
          }),
        ]),
      }),
    );

    (res.json as jest.Mock).mockClear();

    req = {
      query: { page: "2", pageSize: "1" },
    } as unknown as Request;

    await getPaginatedAggregatorInstitutionsHandler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPage: 2,
        pageSize: 1,
        totalRecords: 2,
        totalPages: 2,
        aggregatorInstitutions: expect.arrayContaining([
          expectInstitution(secondInstitution),
        ]),
      }),
    );
  });

  it("filters by aggregatorId", async () => {
    await AggregatorInstitution.create({
      aggregatorId: finicityAggregatorId,
      id: "aggregatorInstitution1",
      name: "Test Aggregator Institution 1",
      url: "https://test-aggregator1.com",
    });

    const mxInstitution = await AggregatorInstitution.create({
      aggregatorId: mxAggregatorId,
      id: "aggregatorInstitution2",
      name: "Test Aggregator Institution 2",
      url: "https://test-aggregator2.com",
    });

    const sophtronInstitution = await AggregatorInstitution.create({
      aggregatorId: sophtronAggregatorId,
      id: "aggregatorInstitution3",
      name: "Test Aggregator Institution 3",
      url: "https://test-aggregator3.com",
    });

    const res = {
      json: jest.fn(),
    } as unknown as Response;

    const req = {
      query: {
        aggregatorIds: `${mxAggregatorId},${sophtronAggregatorId}`,
        page: "1",
        pageSize: "10",
      },
    } as unknown as Request;

    await getPaginatedAggregatorInstitutionsHandler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPage: 1,
        pageSize: 10,
        totalRecords: 2,
        totalPages: 1,
        aggregatorInstitutions: expect.arrayContaining([
          expectInstitution(mxInstitution),
          expectInstitution(sophtronInstitution),
        ]),
      }),
    );
  });

  it("filters by name", async () => {
    await AggregatorInstitution.create({
      aggregatorId: finicityAggregatorId,
      id: "aggregatorInstitution1",
      name: "Bank of the First Order",
      url: "https://test-aggregator1.com",
    });

    const mxInstitution = await AggregatorInstitution.create({
      aggregatorId: mxAggregatorId,
      id: "aggregatorInstitution2",
      name: "Galactic Empire Bank",
      url: "https://test-aggregator2.com",
    });

    const sophtronInstitution = await AggregatorInstitution.create({
      aggregatorId: sophtronAggregatorId,
      id: "aggregatorInstitution3",
      name: "Galactic Empire Credit Union",
      url: "https://test-aggregator3.com",
    });

    const res = {
      json: jest.fn(),
    } as unknown as Response;

    const req = {
      query: {
        name: "galactic empire",
        page: "1",
        pageSize: "10",
      },
    } as unknown as Request;

    await getPaginatedAggregatorInstitutionsHandler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPage: 1,
        pageSize: 10,
        totalRecords: 2,
        totalPages: 1,
        aggregatorInstitutions: expect.arrayContaining([
          expectInstitution(mxInstitution),
          expectInstitution(sophtronInstitution),
        ]),
      }),
    );
  });

  it("filters by matched and unmatched depending on shouldIncludeMatched", async () => {
    const aggregatorInstitutionWithoutAggregatorIntegration =
      await AggregatorInstitution.create({
        aggregatorId: mxAggregatorId,
        id: "aggregatorInstitution1",
        name: "Bank of the First Order",
        url: "https://test-aggregator1.com",
      });

    const aggregatorInstitutionWithActiveAggregatorIntegration =
      await AggregatorInstitution.create({
        aggregatorId: mxAggregatorId,
        id: "aggregatorInstitution2",
        name: "Galactic Empire Bank",
        url: "https://test-aggregator2.com",
      });

    const aggregatorInstitutionWithInactiveAggregatorIntegration =
      await AggregatorInstitution.create({
        aggregatorId: mxAggregatorId,
        id: "aggregatorInstitution3",
        name: "Galactic Empire Credit Union",
        url: "https://test-aggregator3.com",
      });

    const { institution } = await createTestInstitution({});
    const { institution: institution2 } = await createTestInstitution({});

    await AggregatorIntegration.create({
      aggregatorId: mxAggregatorId,
      aggregator_institution_id:
        aggregatorInstitutionWithActiveAggregatorIntegration.id,
      institution_id: institution.id,
      isActive: true,
    });

    await AggregatorIntegration.create({
      aggregatorId: mxAggregatorId,
      aggregator_institution_id:
        aggregatorInstitutionWithInactiveAggregatorIntegration.id,
      institution_id: institution2.id,
      isActive: false,
    });

    const res = {
      json: jest.fn(),
    } as unknown as Response;

    await getPaginatedAggregatorInstitutionsHandler(
      {
        query: {
          page: "1",
          pageSize: "10",
          shouldIncludeMatched: "false",
        },
      } as unknown as Request,
      res,
    );

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPage: 1,
        pageSize: 10,
        totalRecords: 2,
        totalPages: 1,
        aggregatorInstitutions: expect.arrayContaining([
          expectInstitution(
            aggregatorInstitutionWithInactiveAggregatorIntegration,
          ),
          expectInstitution(aggregatorInstitutionWithoutAggregatorIntegration),
        ]),
      }),
    );

    (res.json as jest.Mock).mockClear();

    await getPaginatedAggregatorInstitutionsHandler(
      {
        query: {
          page: "1",
          pageSize: "10",
          shouldIncludeMatched: "true",
        },
      } as unknown as Request,
      res,
    );

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPage: 1,
        pageSize: 10,
        totalRecords: 3,
        totalPages: 1,
        aggregatorInstitutions: expect.arrayContaining([
          expectInstitution(
            aggregatorInstitutionWithInactiveAggregatorIntegration,
          ),
          expectInstitution(aggregatorInstitutionWithoutAggregatorIntegration),
          expectInstitution(
            aggregatorInstitutionWithActiveAggregatorIntegration,
          ),
        ]),
      }),
    );
  });

  it("responds with a 500 and an error on failure", async () => {
    const req = {
      query: { page: "1", pageSize: "1" },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest
      .spyOn(AggregatorInstitution, "findAndCountAll")
      .mockRejectedValueOnce(new Error("Database error"));

    await getPaginatedAggregatorInstitutionsHandler(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error",
    });
  });
});
