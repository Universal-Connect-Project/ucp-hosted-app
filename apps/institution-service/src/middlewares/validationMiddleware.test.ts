import { UiUserPermissions } from "@repo/shared-utils";
import { Request, Response } from "express";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { seedInstitutionId } from "../test/testData/institutions";
import { createTestAuthorization } from "../test/utils";
import {
  validateUserCanEditAggregatorIntegration,
  validateUserCanEditInstitution,
} from "./validationMiddleware";
import { Institution } from "../models/institution";

describe("validationMiddleware", () => {
  describe("validateUserCanEditInstitution", () => {
    it("handles correct permissions", async () => {
      const next = jest.fn();

      const req = {
        headers: {
          authorization: createTestAuthorization([
            UiUserPermissions.UPDATE_INSTITUTION,
          ]),
        },
      } as Request;
      const res = {} as unknown as Response;

      await validateUserCanEditInstitution(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("handles generic error", async () => {
      const next = jest.fn();

      jest.spyOn(Institution, "findByPk").mockRejectedValue(new Error());

      const req = {
        headers: {
          authorization: createTestAuthorization([
            UiUserPermissions.UPDATE_INSTITUTION_AGGREGATOR,
          ]),
        },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await validateUserCanEditInstitution(req, res, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error validating user permission",
      });
    });

    it("handles insufficient scope", async () => {
      const next = jest.fn();

      const req = {
        headers: {
          authorization: createTestAuthorization([]),
        },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await validateUserCanEditInstitution(req, res, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Insufficient permissions",
      });
    });

    it("handles missing institution", async () => {
      const next = jest.fn();

      const req = {
        headers: {
          authorization: createTestAuthorization([
            UiUserPermissions.UPDATE_INSTITUTION_AGGREGATOR,
          ]),
        },
        params: {
          id: crypto.randomUUID(),
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await validateUserCanEditInstitution(req, res, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Institution not found",
      });
    });

    it("handles used by other aggregators", async () => {
      const next = jest.fn();

      const institutionIdWithOtherAggregators =
        "c14e9877-c1e3-4d3a-b449-585086d14845";

      const req = {
        headers: {
          authorization: createTestAuthorization([
            UiUserPermissions.UPDATE_INSTITUTION_AGGREGATOR,
          ]),
        },
        params: {
          id: institutionIdWithOtherAggregators,
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await validateUserCanEditInstitution(req, res, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Aggregator cannot edit an institution used by other aggregators",
      });
    });
  });

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
});
