import { Response } from "express";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { Institution } from "../models/institution";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";
import { createTestInstitution } from "../test/createTestInstitution";
import {
  linkAggregatorInstitution,
  LinkAggregatorInstitutionRequest,
} from "./linkAggregatorInstitution";

describe("linkAggregatorInstitution", () => {
  beforeEach(async () => {
    await AggregatorInstitution.truncate({ force: true });
    await AggregatorIntegration.truncate({ force: true });
    await Institution.truncate({ cascade: true, force: true });
  });

  afterAll(async () => {
    await AggregatorInstitution.truncate({ force: true });
    await AggregatorIntegration.truncate({ force: true });
    await Institution.truncate({ cascade: true, force: true });
  });

  it("should link an aggregator institution to an institution", async () => {
    const finicityAggregatorId = (await getAggregatorByName("finicity")).id;

    const aggregatorInstitution = await AggregatorInstitution.create({
      aggregatorId: finicityAggregatorId,
      id: "agg-inst-123",
      name: "Test Aggregator Institution",
      supportsTransactions: true,
      supportsBalance: false,
      supportsRewards: true,
      supportsOAuth: false,
      supportsAccountOwner: true,
      supportsAccountNumber: false,
      supportsTransactionHistory: true,
    });

    const { institution } = await createTestInstitution({});

    const aggregatorIntegrationsBefore =
      await institution.getAggregatorIntegrations();
    expect(aggregatorIntegrationsBefore.length).toBe(0);

    const res = {
      json: jest.fn(),
    } as unknown as Response;

    const req = {
      body: {
        aggregatorId: finicityAggregatorId,
        aggregatorInstitutionId: aggregatorInstitution.id,
        institutionId: institution.id,
      },
    } as unknown as LinkAggregatorInstitutionRequest;

    await linkAggregatorInstitution(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Aggregator Institution linked successfully",
    });

    const aggregatorIntegrationsAfter =
      await institution.getAggregatorIntegrations();

    expect(aggregatorIntegrationsAfter.length).toBe(1);
    const linkedIntegration = aggregatorIntegrationsAfter[0];
    expect(linkedIntegration).toEqual(
      expect.objectContaining({
        aggregatorId: finicityAggregatorId,
        aggregator_institution_id: aggregatorInstitution.id,
        institution_id: institution.id,
        supports_aggregation: aggregatorInstitution.supportsTransactions,
        supportsBalance: aggregatorInstitution.supportsBalance,
        supportsRewards: aggregatorInstitution.supportsRewards,
        supports_oauth: aggregatorInstitution.supportsOAuth,
        supports_identification: aggregatorInstitution.supportsAccountOwner,
        supports_verification: aggregatorInstitution.supportsAccountNumber,
        supports_history: aggregatorInstitution.supportsTransactionHistory,
      }),
    );
  });

  it("should override an existing aggregator integration", async () => {
    const finicityAggregatorId = (await getAggregatorByName("finicity")).id;

    const aggregatorInstitution = await AggregatorInstitution.create({
      aggregatorId: finicityAggregatorId,
      id: "agg-inst-123",
      name: "Test Aggregator Institution",
      supportsTransactions: true,
      supportsBalance: false,
      supportsRewards: true,
      supportsOAuth: false,
      supportsAccountOwner: true,
      supportsAccountNumber: false,
      supportsTransactionHistory: true,
    });

    const { institution } = await createTestInstitution({
      aggregatorIntegrations: {
        finicity: {
          aggregator_institution_id: "old-agg-inst-456",
          supports_aggregation: false,
          supportsBalance: true,
          supportsRewards: false,
          supports_oauth: true,
          supports_identification: false,
          supports_verification: true,
          supports_history: false,
        },
      },
    });

    const aggregatorIntegrationsBefore =
      await institution.getAggregatorIntegrations();
    expect(aggregatorIntegrationsBefore[0]).toEqual(
      expect.objectContaining({
        aggregatorId: finicityAggregatorId,
        aggregator_institution_id: "old-agg-inst-456",
        institution_id: institution.id,
        supports_aggregation: false,
        supportsBalance: true,
        supportsRewards: false,
        supports_oauth: true,
        supports_identification: false,
        supports_verification: true,
        supports_history: false,
      }),
    );

    const res = {
      json: jest.fn(),
    } as unknown as Response;

    const req = {
      body: {
        aggregatorId: finicityAggregatorId,
        aggregatorInstitutionId: aggregatorInstitution.id,
        institutionId: institution.id,
      },
    } as unknown as LinkAggregatorInstitutionRequest;

    await linkAggregatorInstitution(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Aggregator Institution linked successfully",
    });

    const aggregatorIntegrationsAfter =
      await institution.getAggregatorIntegrations();

    expect(aggregatorIntegrationsAfter.length).toBe(1);
    const linkedIntegration = aggregatorIntegrationsAfter[0];
    expect(linkedIntegration).toEqual(
      expect.objectContaining({
        aggregatorId: finicityAggregatorId,
        aggregator_institution_id: aggregatorInstitution.id,
        institution_id: institution.id,
        supports_aggregation: aggregatorInstitution.supportsTransactions,
        supportsBalance: aggregatorInstitution.supportsBalance,
        supportsRewards: aggregatorInstitution.supportsRewards,
        supports_oauth: aggregatorInstitution.supportsOAuth,
        supports_identification: aggregatorInstitution.supportsAccountOwner,
        supports_verification: aggregatorInstitution.supportsAccountNumber,
        supports_history: aggregatorInstitution.supportsTransactionHistory,
      }),
    );

    expect(await AggregatorIntegration.count()).toBe(1);
  });

  it("should return 404 if aggregator institution not found", async () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const req = {
      body: {
        aggregatorId: 999,
        aggregatorInstitutionId: "non-existent-id",
        institutionId: "some-institution-id",
      },
    } as unknown as LinkAggregatorInstitutionRequest;

    await linkAggregatorInstitution(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Aggregator Institution not found",
    });
  });

  it("should handle errors gracefully", async () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const req = {
      body: {
        aggregatorId: 999,
        aggregatorInstitutionId: "some-id",
        institutionId: "some-institution-id",
      },
    } as unknown as LinkAggregatorInstitutionRequest;

    // Simulate a database error
    jest
      .spyOn(AggregatorInstitution, "findOne")
      .mockRejectedValueOnce(new Error("Database error"));

    await linkAggregatorInstitution(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to link aggregator institution",
    });
  });
});
