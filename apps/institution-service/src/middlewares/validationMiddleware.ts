import { NextFunction, Request, Response } from "express";
import Joi, { ObjectSchema } from "joi";
import {
  validateUserCanEditInstitution as editInstitutionValidation,
  EditInstitutionValidationErrorReason,
} from "../shared/utils/permissionValidation";

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
  const canUserEditInstitution = await editInstitutionValidation({
    institutionId: req.params.id,
    req,
  });

  const errorMap = {
    [EditInstitutionValidationErrorReason.GenericError]: {
      error: "Error validating user permission",
      status: 500,
    },
    [EditInstitutionValidationErrorReason.InsufficientScope]: {
      error: "Insufficient permissions",
      status: 403,
    },
    [EditInstitutionValidationErrorReason.InvalidInstitutionId]: {
      error: "Institution not found",
      status: 404,
    },
    [EditInstitutionValidationErrorReason.UsedByOtherAggregators]: {
      error: "Aggregator cannot edit an institution used by other aggregators",
      status: 403,
    },
  };

  if (canUserEditInstitution === true) {
    return next();
  }

  const { error, status } =
    errorMap[canUserEditInstitution] ||
    errorMap[EditInstitutionValidationErrorReason.GenericError];

  return res.status(status).json({
    error,
  });
};
