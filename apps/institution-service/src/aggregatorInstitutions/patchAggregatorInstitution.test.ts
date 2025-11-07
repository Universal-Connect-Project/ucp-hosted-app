import { Response } from "express";
import {
  patchAggregatorInstitution,
  PatchAggregatorInstitutionRequest,
} from "./patchAggregatorInstitution";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";
import { createAuthorizationHeaders } from "../test/token";
import { UiUserPermissions } from "@repo/shared-utils";

const headersWithAccess = createAuthorizationHeaders({
  jwtPayload: {
    permissions: [UiUserPermissions.UPDATE_AGGREGATOR_INSTITUTION],
  },
});

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
      headers: {
        ...headersWithAccess,
      },
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
      headers: {
        ...headersWithAccess,
      },
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
      headers: {
        ...headersWithAccess,
      },
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
      headers: {
        ...headersWithAccess,
      },
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

  describe("permission validation", () => {
    it("should return 403 if user lacks either permission", async () => {
      const req = {
        body: { isReviewed: true },
        headers: {},
        params: {
          aggregatorId: finicityAggregatorId,
          aggregatorInstitutionId: "inst_123",
        },
      } as unknown as PatchAggregatorInstitutionRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await patchAggregatorInstitution(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Insufficient permissions",
      });
    });

    it("should return 403 if user has aggregator permission but is acting on a different aggregator", async () => {
      const aggregatorInstitution = await AggregatorInstitution.create({
        id: "inst_123",
        name: "Test Institution",
        aggregatorId: finicityAggregatorId,
      });

      const req = {
        body: { isReviewed: true },
        headers: {
          ...createAuthorizationHeaders({
            jwtPayload: {
              permissions: [
                UiUserPermissions.UPDATE_AGGREGATOR_INSTITUTION_AS_AGGREGATOR,
              ],
              "ucw/appMetaData": {
                aggregatorId: "mx",
              },
            },
          }),
        },
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "An aggregator admin can only manage their own aggregator institutions",
      });
    });

    it(`should work if the user has ${UiUserPermissions.UPDATE_AGGREGATOR_INSTITUTION} permission`, async () => {
      const aggregatorInstitution = await AggregatorInstitution.create({
        id: "inst_123",
        name: "Test Institution",
        aggregatorId: finicityAggregatorId,
      });

      const req = {
        body: { isReviewed: true },
        headers: {
          ...createAuthorizationHeaders({
            jwtPayload: {
              permissions: [UiUserPermissions.UPDATE_AGGREGATOR_INSTITUTION],
            },
          }),
        },
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
    });

    it(`should work if the user has ${UiUserPermissions.UPDATE_AGGREGATOR_INSTITUTION_AS_AGGREGATOR} permission and is acting on their own aggregator`, async () => {
      const aggregatorInstitution = await AggregatorInstitution.create({
        id: "inst_123",
        name: "Test Institution",
        aggregatorId: finicityAggregatorId,
      });

      const req = {
        body: { isReviewed: true },
        headers: {
          ...createAuthorizationHeaders({
            jwtPayload: {
              permissions: [
                UiUserPermissions.UPDATE_AGGREGATOR_INSTITUTION_AS_AGGREGATOR,
              ],
              "ucw/appMetaData": {
                aggregatorId: "finicity",
              },
            },
          }),
        },
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
    });
  });
});
