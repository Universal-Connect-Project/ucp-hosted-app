import { UiUserPermissions } from "@repo/shared-utils";
import { Request, Response } from "express";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { seedInstitutionId } from "../test/testData/institutions";
import { createTestAuthorization } from "../test/utils";
import { validateUserCanEditAggregatorIntegration } from "./validationMiddleware";

describe("validateUserCanEditAggregatorIntegration", () => {
  it("passes validation when super user permission", async () => {
    const next = jest.fn();

    const req = {
      headers: {
        authorization: createTestAuthorization([
          UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION,
        ]),
      },
    } as Request;
    const res = {} as unknown as Response;

    await validateUserCanEditAggregatorIntegration(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("returns 403 when user doesn't have correct permission", async () => {
    const next = jest.fn();

    const req = {
      headers: {
        authorization: createTestAuthorization([
          UiUserPermissions.CREATE_INSTITUTION,
        ]),
      },
    } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await validateUserCanEditAggregatorIntegration(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Insufficient permissions",
    });
  });

  it("returns 404 when user aggregatorIntegration is not found", async () => {
    const next = jest.fn();

    const req = {
      params: {
        id: -1,
      },
      headers: {
        authorization: createTestAuthorization([
          UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
        ]),
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await validateUserCanEditAggregatorIntegration(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Aggregator Integration not found",
    });
  });

  it("returns 403 when a user is trying to update an aggregator other than their own", async () => {
    const testAggregatorIntegrations = await AggregatorIntegration.findAll({
      where: { institution_id: seedInstitutionId },
      raw: true,
    });
    const sophtronAggregatorIntegration = testAggregatorIntegrations.find(
      (aggInt) => aggInt.aggregator_institution_id == "sophtron_bank",
    );

    const next = jest.fn();

    const req = {
      params: {
        id: sophtronAggregatorIntegration?.id,
      },
      headers: {
        authorization: createTestAuthorization([
          UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
        ]),
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await validateUserCanEditAggregatorIntegration(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "An Aggregator cannot edit an aggregatorIntegration belonging to another aggregator",
    });
  });

  it("passes when an aggregator attempts to update an aggregatorIntegration of their own", async () => {
    const testAggregatorIntegrations = await AggregatorIntegration.findAll({
      where: { institution_id: seedInstitutionId },
      raw: true,
    });
    const mxAggregatorIntegration = testAggregatorIntegrations.find(
      (aggInt) => aggInt.aggregator_institution_id == "mx_bank",
    );

    const next = jest.fn();

    const req = {
      params: {
        id: mxAggregatorIntegration?.id,
      },
      headers: {
        authorization: createTestAuthorization([
          UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
        ]),
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await validateUserCanEditAggregatorIntegration(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
