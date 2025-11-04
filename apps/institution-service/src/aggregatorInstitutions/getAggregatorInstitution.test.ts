/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";
import { getAggregatorInstitution } from "./getAggregatorInstitution";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { createTestInstitution } from "../test/createTestInstitution";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { Institution } from "../models/institution";

describe("getAggregatorInstitution", () => {
  beforeEach(async () => {
    await AggregatorInstitution.truncate({ cascade: true, force: true });
    await AggregatorIntegration.truncate({ cascade: true, force: true });
    await Institution.truncate({ cascade: true, force: true });
  });

  afterAll(async () => {
    await AggregatorInstitution.truncate({ cascade: true, force: true });
    await AggregatorIntegration.truncate({ cascade: true, force: true });
    await Institution.truncate({ cascade: true, force: true });
  });

  it("should retrieve an aggregator institution by ID and aggregatorId and include the aggregator and matched institutions", async () => {
    const finicityAggregatorId = (await getAggregatorByName("finicity")).id;

    const id = "testInstitution";

    await AggregatorInstitution.create({
      id,
      aggregatorId: finicityAggregatorId,
      name: "Test Institution",
    });

    const { institution: institution1 } = await createTestInstitution({
      aggregatorIntegrations: {
        finicity: {
          aggregator_institution_id: id,
        },
      },
    });

    const req = {
      params: {
        aggregatorId: finicityAggregatorId,
        id,
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getAggregatorInstitution(req, res);

    const firstCall = (res.json as jest.Mock).mock.calls[0][0];

    expect(firstCall.institution.institutions).toHaveLength(1);

    expect(res.json).toHaveBeenCalledWith({
      institution: expect.objectContaining({
        id,
        aggregatorId: finicityAggregatorId,
        aggregator: expect.objectContaining({
          id: finicityAggregatorId,
          name: "finicity",
        }),
        institutions: expect.arrayContaining([
          expect.objectContaining({
            id: institution1.id,
          }),
        ]),
      }),
    });
  });

  it("should return 404 if the aggregator institution is not found", async () => {
    const req = {
      params: {
        aggregatorId: 9999,
        id: "nonExistentId",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getAggregatorInstitution(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Aggregator Institution not found",
    });
  });

  it("should handle errors and return 500", async () => {
    const req = {
      params: {
        aggregatorId: 1,
        id: "someId",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest
      .spyOn(AggregatorInstitution, "findOne")
      .mockRejectedValueOnce(new Error("Database error"));

    await getAggregatorInstitution(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to fetch aggregator institution",
    });
  });
});
