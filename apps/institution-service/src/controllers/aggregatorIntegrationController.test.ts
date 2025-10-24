/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import { CreationAttributes, Model } from "sequelize";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { mxAggregatorId } from "../test/testData/aggregators";
import { seedInstitutionId } from "../test/testData/institutions";
import {
  createAggregatorIntegration,
  deleteAggregatorIntegration,
  updateAggregatorIntegration,
} from "./aggregatorIntegrationController";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";
import { Institution } from "../models/institution";
import { createTestInstitution } from "../test/createTestInstitution";

describe("updateAggregatorIntegration", () => {
  let aggregatorIntegration: AggregatorIntegration;
  let createTestAggregatorIntegrationBody: CreationAttributes<AggregatorIntegration>;
  let mxAggregatorId: number;

  let testInstitution: Institution;

  beforeAll(async () => {
    mxAggregatorId = (await getAggregatorByName("mx")).id;
  });

  beforeEach(async () => {
    testInstitution = await Institution.create({
      name: "Test Institution",
      url: "https://www.testinstitution.com",
      is_test_bank: true,
      logo: "test",
      keywords: [],
    });

    createTestAggregatorIntegrationBody = {
      aggregatorId: mxAggregatorId,
      institution_id: testInstitution.id,
      isActive: true,
      aggregator_institution_id: "mx",
      supports_oauth: true,
      supports_identification: true,
      supports_verification: true,
      supports_aggregation: true,
      supports_history: true,
      supportsRewards: true,
      supportsBalance: true,
    };

    aggregatorIntegration = await AggregatorIntegration.create(
      createTestAggregatorIntegrationBody,
    );
  });

  afterEach(async () => {
    await testInstitution.destroy({ force: true });

    await aggregatorIntegration.destroy();
  });

  it("responds with 200 when aggregatorIntegration params are valid", async () => {
    const req = {
      params: { id: aggregatorIntegration.id },
      body: {
        isActive: false,
        supports_oauth: false,
        supports_identification: false,
        supports_verification: false,
        supports_aggregation: false,
        supports_history: false,
        supportsRewards: false,
        supportsBalance: false,
      },
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await updateAggregatorIntegration(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "AggregatorIntegration updated successfully",
        aggregatorIntegration: expect.objectContaining({
          isActive: false,
          supports_oauth: false,
          supports_identification: false,
          supports_verification: false,
          supports_aggregation: false,
          supports_history: false,
          supportsRewards: false,
          supportsBalance: false,
        }),
      }),
    );
  });

  it("responds with 404 when aggregatorIntegration is not found", async () => {
    const req = {
      params: { id: -1 },
      body: {
        isActive: false,
      },
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await updateAggregatorIntegration(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "aggregatorIntegration not found",
      }),
    );
  });

  it("responds with 500 when there's an error updating the aggregatorIntegration", async () => {
    const req = {
      params: { id: aggregatorIntegration.id },
      body: {},
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    jest.spyOn(AggregatorIntegration, "findByPk").mockResolvedValue({
      update: jest.fn().mockRejectedValue(new Error("Server broke")),
    } as unknown as Model);

    await updateAggregatorIntegration(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred while updating the AggregatorIntegration",
    });
  });
});

describe("createAggregatorIntegration", () => {
  it("creates an aggregatorIntegration with default values", async () => {
    const { cleanupInstitution, institution } = await createTestInstitution({});

    const mxAggregatorId = (await getAggregatorByName("mx")).id;

    const testBankId = "testBankId";
    const req = {
      body: {
        institution_id: institution.id,
        aggregatorId: mxAggregatorId,
        aggregator_institution_id: testBankId,
      },
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await createAggregatorIntegration(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "AggregatorIntegration created successfully",
      aggregatorIntegration: expect.objectContaining({
        aggregator_institution_id: testBankId,
        aggregatorId: mxAggregatorId,
        institution_id: institution.id,
        isActive: true,
        supports_oauth: false,
        supports_identification: false,
        supports_verification: false,
        supports_aggregation: true,
        supports_history: false,
        supportsRewards: false,
        supportsBalance: false,
      }),
    });

    await cleanupInstitution();
  });

  it("creates an aggregatorIntegration with custom values", async () => {
    const { cleanupInstitution, institution } = await createTestInstitution({});

    const customValues = {
      isActive: false,
      supports_oauth: true,
      supports_identification: true,
      supports_verification: true,
      supports_aggregation: false,
      supports_history: true,
      supportsRewards: true,
      supportsBalance: true,
      institution_id: institution.id,
      aggregatorId: (await getAggregatorByName("mx")).id,
      aggregator_institution_id: "testBankId",
    };
    const req = {
      body: customValues,
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await createAggregatorIntegration(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "AggregatorIntegration created successfully",
      aggregatorIntegration: expect.objectContaining({
        ...customValues,
      }),
    });

    await cleanupInstitution();
  });

  it("returns 400 for invalid data", async () => {
    const req = {
      body: {
        institution_id: seedInstitutionId,
        aggregatorId: mxAggregatorId,
        aggregator_institution_id: null,
      },
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await createAggregatorIntegration(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error:
          'null value in column "aggregator_institution_id" of relation "aggregatorIntegrations" violates not-null constraint',
      }),
    );
  });

  it("returns 409 for trying to create an integration when one already exists on the Institution/Aggregator combo", async () => {
    const { aggregatorIntegrations, cleanupInstitution, institution } =
      await createTestInstitution({
        aggregatorIntegrations: { mx: true },
      });

    const createBody = {
      institution_id: institution.id,
      aggregatorId: aggregatorIntegrations.mx.aggregatorId,
      aggregator_institution_id: "mx_bank",
    };

    const req = {
      body: createBody,
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await createAggregatorIntegration(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error:
          "An AggregatorIntegration for that Institution/Aggregator already exists.",
      }),
    );

    await cleanupInstitution();
  });
});

describe("deleteAggregatorIntegration", () => {
  it("returns 204 when an aggregatorIntegration is deleted", async () => {
    const { cleanupInstitution, aggregatorIntegrations } =
      await createTestInstitution({
        aggregatorIntegrations: { mx: true },
      });

    const createdAggregatorIntegration = aggregatorIntegrations.mx;

    const req = {
      params: { id: createdAggregatorIntegration.id },
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await deleteAggregatorIntegration(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(204);

    await cleanupInstitution();
  });

  it("returns 404 when an aggregatorIntegration is not found", async () => {
    const req = {
      params: { id: -1 },
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await deleteAggregatorIntegration(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
