/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import { Model } from "sequelize";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { createTestAggregatorIntegrationBody } from "../test/testData/aggregatorIntegrations";
import { updateAggregatorIntegration } from "./aggregatorIntegrationController";

describe("updateAggregatorIntegration", () => {
  let aggregatorIntegration: AggregatorIntegration;

  beforeAll(async () => {
    aggregatorIntegration = await AggregatorIntegration.create(
      createTestAggregatorIntegrationBody,
    );
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
