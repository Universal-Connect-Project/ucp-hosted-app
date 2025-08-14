/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/unbound-method */
import { http, HttpResponse } from "msw";
import { server } from "../shared/tests/testServer";
import { INSTITUTION_SERVICE_INSTITUTIONS_URL } from "../shared/tests/handlers";
import { testInstitutionsResponse } from "../shared/tests/testData/institutions";
import { getInstitutionsWithPerformance } from "./getInstitutionsWithPerformance";
import { Request, Response } from "express";
import { testAggregators } from "../shared/tests/testData/aggregators";
import { seedInfluxTestDb } from "../shared/tests/utils";
import { ComboJobTypes } from "@repo/shared-utils";

const longDuration = 1000000000;

describe("getInstitutionsWithPerformance", () => {
  beforeEach(async () => {
    await seedInfluxTestDb({
      duration: 100,
      institutionId: testInstitutionsResponse.institutions[0].id,
      jobTypes: [ComboJobTypes.TRANSACTIONS],
    });

    await seedInfluxTestDb({
      duration: longDuration,
      institutionId: testInstitutionsResponse.institutions[0].id,
      jobTypes: [ComboJobTypes.ACCOUNT_NUMBER],
      timestamp: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
    });
  });

  it("passes page and search parameters to the institutions request", async () => {
    let queryParams;

    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, ({ request }) => {
        const { searchParams } = new URL(request.url);

        queryParams = Object.fromEntries(searchParams.entries());

        return HttpResponse.json(testInstitutionsResponse);
      }),
    );

    const page = "1";
    const pageSize = "10";
    const search = "test institution";
    const sortBy = "name:asc";

    const req = {
      query: {
        page,
        pageSize,
        search,
        sortBy,
        timeFrame: "30d",
      },
    } as unknown as Request;
    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await getInstitutionsWithPerformance(req, res);

    expect(queryParams).toEqual({
      page,
      pageSize,
      search,
      sortBy,
    });
  });

  it("returns an empty institutions list when no institutions are found", async () => {
    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, () =>
        HttpResponse.json({
          currentPage: 1,
          pageSize: 10,
          totalRecords: 0,
          totalPages: 0,
          institutions: [],
        }),
      ),
    );

    const req = {
      query: {
        page: "1",
        pageSize: "10",
        timeFrame: "30d",
      },
    } as unknown as Request;
    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await getInstitutionsWithPerformance(req, res);

    const {
      aggregators,
      currentPage,
      pageSize,
      totalRecords,
      totalPages,
      institutions,
    } = (res.send as jest.Mock).mock.calls[0][0];

    expect(aggregators).toEqual(testAggregators);
    expect(currentPage).toEqual(1);
    expect(pageSize).toEqual(10);
    expect(totalRecords).toEqual(0);
    expect(totalPages).toEqual(0);

    expect(aggregators).toEqual(testAggregators);
    expect(institutions).toEqual([]);
  });

  it("filters by jobTypes and timeFrame, doesn't filter by job types if empty string, and multiplies the results", async () => {
    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await getInstitutionsWithPerformance(
      {
        query: {
          page: "1",
          pageSize: "10",
          timeFrame: "30d",
        },
      } as unknown as Request,
      res,
    );

    await getInstitutionsWithPerformance(
      {
        query: {
          jobTypes: "",
          page: "1",
          pageSize: "10",
          timeFrame: "90d",
        },
      } as unknown as Request,
      res,
    );

    await getInstitutionsWithPerformance(
      {
        query: {
          jobTypes: ComboJobTypes.TRANSACTIONS,
          page: "1",
          pageSize: "10",
          timeFrame: "90d",
        },
      } as unknown as Request,
      res,
    );

    await getInstitutionsWithPerformance(
      {
        query: {
          jobTypes: ComboJobTypes.ACCOUNT_NUMBER,
          page: "1",
          pageSize: "10",
          timeFrame: "90d",
        },
      } as unknown as Request,
      res,
    );

    const getFirstArg = (callIndex: number) =>
      (res.send as jest.Mock).mock.calls[callIndex][0];

    const firstCallFirstArg = getFirstArg(0);

    expect(firstCallFirstArg.aggregators).toEqual(testAggregators);
    expect(firstCallFirstArg.currentPage).toEqual(
      testInstitutionsResponse.currentPage,
    );
    expect(firstCallFirstArg.pageSize).toEqual(
      testInstitutionsResponse.pageSize,
    );
    expect(firstCallFirstArg.totalRecords).toEqual(
      testInstitutionsResponse.totalRecords,
    );
    expect(firstCallFirstArg.totalPages).toEqual(
      testInstitutionsResponse.totalPages,
    );

    const getPerformanceResults = (callIndex: number) =>
      getFirstArg(callIndex).institutions[0].performance;

    for (let i = 0; i < 3; i++) {
      const currentPerformanceResults = getPerformanceResults(i);

      console.log({ currentPerformanceResults });

      expect(currentPerformanceResults).not.toEqual(
        getPerformanceResults(i + 1),
      );
    }

    const secondPerformanceResults = getPerformanceResults(1);

    expect(secondPerformanceResults.mx.avgSuccessRate).toEqual(100);
    expect(secondPerformanceResults.mx.avgDuration).toEqual(
      longDuration / 1000,
    );
  });

  it("responds with a 400 if there's an issue", async () => {
    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, () =>
        HttpResponse.json(null, { status: 500 }),
      ),
    );

    const req = {
      query: {
        page: "1",
        pageSize: "10",
        search: "all data testing",
        timeFrame: "30d",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    await getInstitutionsWithPerformance(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Internal Server Error",
    });
  });
});
