/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import { getPaginatedAggregatorInstitutionsHandler } from "./getPaginatedAggregatorInstitutionsHandler";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";

describe("getPaginatedAggregatorInstitutionsHandler", () => {
  let finicityAggregatorId: number;
  let mxAggregatorId: number;
  let sophtronAggregatorId: number;

  beforeEach(async () => {
    await AggregatorInstitution.destroy({ where: {}, force: true });
    finicityAggregatorId = (await getAggregatorByName("finicity")).id;
    mxAggregatorId = (await getAggregatorByName("mx")).id;
    sophtronAggregatorId = (await getAggregatorByName("sophtron")).id;
  });

  it("returns a list of institutions by page and pageSize", async () => {
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
          expect.objectContaining({
            id: secondInstitution.id,
            name: secondInstitution.name,
            createdAt: secondInstitution.createdAt,
            updatedAt: secondInstitution.updatedAt,
            supportsAccountOwner: secondInstitution.supportsAccountOwner,
            supportsAccountNumber: secondInstitution.supportsAccountNumber,
            supportsBalance: secondInstitution.supportsBalance,
            supportsOAuth: secondInstitution.supportsOAuth,
            supportsRewards: secondInstitution.supportsRewards,
            supportsTransactions: secondInstitution.supportsTransactions,
            supportsTransactionHistory:
              secondInstitution.supportsTransactionHistory,
            url: secondInstitution.url,
          }),
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
          expect.objectContaining({
            id: mxInstitution.id,
            name: mxInstitution.name,
            createdAt: mxInstitution.createdAt,
            updatedAt: mxInstitution.updatedAt,
            supportsAccountOwner: mxInstitution.supportsAccountOwner,
            supportsAccountNumber: mxInstitution.supportsAccountNumber,
            supportsBalance: mxInstitution.supportsBalance,
            supportsOAuth: mxInstitution.supportsOAuth,
            supportsRewards: mxInstitution.supportsRewards,
            supportsTransactions: mxInstitution.supportsTransactions,
            supportsTransactionHistory:
              mxInstitution.supportsTransactionHistory,
            url: mxInstitution.url,
          }),
          expect.objectContaining({
            id: sophtronInstitution.id,
            name: sophtronInstitution.name,
            createdAt: sophtronInstitution.createdAt,
            updatedAt: sophtronInstitution.updatedAt,
            supportsAccountOwner: sophtronInstitution.supportsAccountOwner,
            supportsAccountNumber: sophtronInstitution.supportsAccountNumber,
            supportsBalance: sophtronInstitution.supportsBalance,
            supportsOAuth: sophtronInstitution.supportsOAuth,
            supportsRewards: sophtronInstitution.supportsRewards,
            supportsTransactions: sophtronInstitution.supportsTransactions,
            supportsTransactionHistory:
              sophtronInstitution.supportsTransactionHistory,
            url: sophtronInstitution.url,
          }),
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
          expect.objectContaining({
            id: mxInstitution.id,
            name: mxInstitution.name,
            createdAt: mxInstitution.createdAt,
            updatedAt: mxInstitution.updatedAt,
            supportsAccountOwner: mxInstitution.supportsAccountOwner,
            supportsAccountNumber: mxInstitution.supportsAccountNumber,
            supportsBalance: mxInstitution.supportsBalance,
            supportsOAuth: mxInstitution.supportsOAuth,
            supportsRewards: mxInstitution.supportsRewards,
            supportsTransactions: mxInstitution.supportsTransactions,
            supportsTransactionHistory:
              mxInstitution.supportsTransactionHistory,
            url: mxInstitution.url,
          }),
          expect.objectContaining({
            id: sophtronInstitution.id,
            name: sophtronInstitution.name,
            createdAt: sophtronInstitution.createdAt,
            updatedAt: sophtronInstitution.updatedAt,
            supportsAccountOwner: sophtronInstitution.supportsAccountOwner,
            supportsAccountNumber: sophtronInstitution.supportsAccountNumber,
            supportsBalance: sophtronInstitution.supportsBalance,
            supportsOAuth: sophtronInstitution.supportsOAuth,
            supportsRewards: sophtronInstitution.supportsRewards,
            supportsTransactions: sophtronInstitution.supportsTransactions,
            supportsTransactionHistory:
              sophtronInstitution.supportsTransactionHistory,
            url: sophtronInstitution.url,
          }),
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
