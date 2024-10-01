import { UiUserPermissions } from "@repo/shared-utils";
import { NextFunction, Request, Response } from "express";
import Joi, { ObjectSchema } from "joi";
import jwt from "jsonwebtoken";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { Institution } from "../models/institution";

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    next();
  };
};

export const institutionSchema = Joi.object({
  name: Joi.string(),
  keywords: Joi.array().items(Joi.string()),
  logo: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .messages({
      "string.uri": "The url must be a valid URL",
    }),
  url: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .messages({
      "string.uri": "The url must be a valid URL",
    }),
  is_test_bank: Joi.boolean(),
  routing_numbers: Joi.array()
    .items(Joi.string().pattern(/^\d{9}$/, "9 digits"))
    .messages({
      "string.pattern.base": "Each routing number must be exactly 9 digits",
      "array.base": "Routing numbers must be an array of strings",
    }),
});

export const aggregatorIntegrationUpdateSchema = Joi.object({
  aggregator_institution_id: Joi.string(),
  supports_oauth: Joi.boolean(),
  supports_identification: Joi.boolean(),
  supports_verification: Joi.boolean(),
  supports_aggregation: Joi.boolean(),
  supports_history: Joi.boolean(),
  isActive: Joi.boolean(),
});

export interface DecodedToken {
  permissions: string[];
  "ucw/appMetaData": {
    aggregatorId: string;
  };
}

export const validateUserCanEditInstitution = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")?.[1];
    const decodedToken = jwt.decode(token as string) as DecodedToken;
    const permissions = decodedToken.permissions;
    if (permissions.includes(UiUserPermissions.UPDATE_INSTITUTION)) {
      return next();
    } else if (
      !permissions.includes(UiUserPermissions.UPDATE_INSTITUTION_AGGREGATOR)
    ) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const institution = await Institution.findByPk(req.params.id);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const aggregatorId = decodedToken["ucw/appMetaData"].aggregatorId;

    const aggregators = await institution?.getAggregators({ raw: true });
    const hasOtherAggregators = aggregators?.some(
      (aggregator) => aggregator.name !== aggregatorId,
    );

    if (hasOtherAggregators) {
      return res.status(403).json({
        error:
          "Aggregator cannot edit an institution used by other aggregators",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: "Error validating user permission" });
  }
};

export const validateUserCanEditAggregatorIntegration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")?.[1];
    const decodedToken = jwt.decode(token as string) as DecodedToken;
    const permissions = decodedToken.permissions;
    if (permissions.includes(UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION)) {
      return next();
    } else if (
      !permissions.includes(
        UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
      )
    ) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const aggregatorIntegration = await AggregatorIntegration.findByPk(
      req.params.id,
    );
    if (!aggregatorIntegration) {
      return res
        .status(404)
        .json({ error: "Aggregator Integration not found" });
    }

    const aggregatorName = decodedToken["ucw/appMetaData"].aggregatorId;
    const aggregator = await aggregatorIntegration?.getAggregator();

    if (aggregatorName !== aggregator.name) {
      return res.status(403).json({
        error:
          "An Aggregator cannot edit an aggregatorIntegration belonging to another aggregator",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: "Error validating user permission" });
  }
};
