import { UiUserPermissions } from "@repo/shared-utils";
import { NextFunction, Request, Response } from "express";
import Joi, { ObjectSchema } from "joi";
import jwt from "jsonwebtoken";
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

export const institutionUpdateSchema = Joi.object({
  name: Joi.string(),
  keywords: Joi.string(),
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

export const institutionCreateSchema = institutionUpdateSchema.append({
  ucp_id: Joi.string().required(),
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
    const providers = await institution?.getProviders();
    const hasOtherProviders = providers?.some(
      (provider) => provider.name !== aggregatorId,
    );

    if (hasOtherProviders) {
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
