import { UiUserPermissions } from "@repo/shared-utils";
import { Request, Response } from "express";
import { Aggregator } from "../models/aggregator";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { seedInstitutionId } from "../test/testData/institutions";
import { createTestAuthorization } from "../test/utils";
import {
  validateUserCanCreateAggregatorIntegration,
  validateUserCanEditAggregatorIntegration,
} from "./validationMiddleware";

describe("validateUserCanEditAggregatorIntegration", () => {
  it("passes validation when super user permission", async () => {
    const next = jest.fn();

    const req = {
      headers: {
        authorization: createTestAuthorization({
          permissions: [UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION],
        }),
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
        authorization: createTestAuthorization({
          permissions: [UiUserPermissions.CREATE_INSTITUTION],
        }),
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
        authorization: createTestAuthorization({
          permissions: [
            UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
          ],
        }),
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
        authorization: createTestAuthorization({
          permissions: [
            UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
          ],
        }),
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
        authorization: createTestAuthorization({
          permissions: [
            UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
          ],
        }),
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

describe("validateUserCanCreateAggregatorIntegration", () => {
  it("passes validation when super user permission", async () => {
    const next = jest.fn();

    const req = {
      headers: {
        authorization: createTestAuthorization({
          permissions: [UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION],
        }),
      },
    } as Request;
    const res = {} as unknown as Response;

    await validateUserCanCreateAggregatorIntegration(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("returns 403 when user doesn't have correct permission", async () => {
    const next = jest.fn();

    const req = {
      headers: {
        authorization: createTestAuthorization({
          permissions: [UiUserPermissions.CREATE_INSTITUTION],
        }),
      },
    } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await validateUserCanCreateAggregatorIntegration(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Insufficient permissions",
    });
  });

  it("returns 500 when user doesn't have aggregatorId in their meta data", async () => {
    const aggregators = await Aggregator.findAll({ raw: true });
    const mxAggregator = aggregators.find(
      (aggregator) => aggregator.name === "mx",
    );
    const next = jest.fn();

    const req = {
      body: {
        instituion_id: seedInstitutionId,
        aggregatorId: mxAggregator?.id,
        supports_oauth: true,
      },
      headers: {
        authorization: createTestAuthorization({
          permissions: [
            UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
          ],
          aggregatorId: "junk",
        }),
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await validateUserCanCreateAggregatorIntegration(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "This user doesn't have the required aggregatorId in their metadata",
    });
  });

  it("returns 403 when an mx aggregator is trying to create a integration for a sophtron aggregator", async () => {
    const aggregators = await Aggregator.findAll({ raw: true });
    const sophtronAggregator = aggregators.find(
      (aggregator) => aggregator.name === "sophtron",
    );

    const next = jest.fn();

    const req = {
      body: {
        instituion_id: seedInstitutionId,
        aggregatorId: sophtronAggregator?.id,
        supports_oauth: true,
      },
      headers: {
        authorization: createTestAuthorization({
          permissions: [
            UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
          ],
          aggregatorId: "mx",
        }),
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await validateUserCanCreateAggregatorIntegration(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "An Aggregator cannot create an aggregatorIntegration belonging to another aggregator",
    });
  });

  it("passes when an sophtron attempts to create an aggregatorIntegration of their own", async () => {
    const aggregators = await Aggregator.findAll({ raw: true });
    const sophtronAggregator = aggregators.find(
      (aggregator) => aggregator.name === "sophtron",
    );
    const next = jest.fn();

    const req = {
      body: {
        instituion_id: seedInstitutionId,
        aggregatorId: sophtronAggregator?.id,
        supports_oauth: true,
      },
      headers: {
        authorization: createTestAuthorization({
          permissions: [
            UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
          ],
          aggregatorId: "sophtron",
        }),
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await validateUserCanCreateAggregatorIntegration(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
