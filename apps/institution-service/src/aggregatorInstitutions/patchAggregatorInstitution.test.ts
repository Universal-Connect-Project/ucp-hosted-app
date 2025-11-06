import { Response } from "express";
import {
  patchAggregatorInstitution,
  PatchAggregatorInstitutionRequest,
} from "./patchAggregatorInstitution";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";

describe("patchAggregatorInstitution", () => {
  let finicityAggregatorId: number;

  beforeAll(async () => {
    finicityAggregatorId = (await getAggregatorByName("finicity")).id;
  });

  beforeEach(async () => {
    await AggregatorInstitution.truncate({ force: true });
  });

  afterAll(async () => {
    await AggregatorInstitution.truncate({ force: true });
  });

  it("should update the reviewedAt field when isReviewed is true", async () => {
    const aggregatorInstitution = await AggregatorInstitution.create({
      id: "inst_123",
      name: "Test Institution",
      aggregatorId: finicityAggregatorId,
    });

    expect(aggregatorInstitution.reviewedAt).toBeNull();

    const req = {
      body: { isReviewed: true },
      params: {
        aggregatorId: aggregatorInstitution.aggregatorId,
        aggregatorInstitutionId: aggregatorInstitution.id,
      },
    } as unknown as PatchAggregatorInstitutionRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await patchAggregatorInstitution(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        aggregatorInstitution: expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          reviewedAt: expect.any(Date),
        }),
      }),
    );

    await aggregatorInstitution.reload();
    expect(aggregatorInstitution.reviewedAt).toBeInstanceOf(Date);
  });

  it("should set the reviewedAt field to null when isReviewed is false", async () => {
    const aggregatorInstitution = await AggregatorInstitution.create({
      id: "inst_123",
      name: "Test Institution",
      aggregatorId: finicityAggregatorId,
      reviewedAt: new Date(),
    });

    expect(aggregatorInstitution.reviewedAt).toBeDefined();

    const req = {
      body: { isReviewed: false },
      params: {
        aggregatorId: aggregatorInstitution.aggregatorId,
        aggregatorInstitutionId: aggregatorInstitution.id,
      },
    } as unknown as PatchAggregatorInstitutionRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await patchAggregatorInstitution(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        aggregatorInstitution: expect.objectContaining({
          reviewedAt: null,
        }),
      }),
    );

    await aggregatorInstitution.reload();
    expect(aggregatorInstitution.reviewedAt).toBeNull();
  });

  it("should return 404 if the Aggregator Institution is not found", async () => {
    const req = {
      body: { isReviewed: true },
      params: {
        aggregatorId: finicityAggregatorId,
        aggregatorInstitutionId: "non_existent_id",
      },
    } as unknown as PatchAggregatorInstitutionRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await patchAggregatorInstitution(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Aggregator Institution not found",
    });
  });

  it("should handle internal server errors gracefully", async () => {
    const req = {
      body: { isReviewed: true },
      params: {
        aggregatorId: finicityAggregatorId,
        aggregatorInstitutionId: "inst_123",
      },
    } as unknown as PatchAggregatorInstitutionRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest
      .spyOn(AggregatorInstitution, "findOne")
      .mockRejectedValue(new Error("Database error"));

    await patchAggregatorInstitution(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to patch aggregator institution",
    });
  });
});
