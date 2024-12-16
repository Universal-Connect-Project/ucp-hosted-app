import { UiUserPermissions } from "@repo/shared-utils";
import { UUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import Joi, { ObjectSchema } from "joi";
import jwt from "jsonwebtoken";
import { Aggregator } from "../models/aggregator";
import {
  validateUserCanDeleteAggregatorIntegration as deleteAggIntValidation,
  validateUserCanEditAggregatorIntegration as editAggIntValidation,
  ActOnAggregatorIntegrationValidationErrorReason,
  validateUserCanEditInstitution as editInstitutionValidation,
  validateUserCanDeleteInstitution as deleteInstitutionValidation,
  ActOnInstitutionValidationErrorReason,
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
    })
    .allow(null),
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

export const aggregatorIntegrationCreateSchema =
  aggregatorIntegrationUpdateSchema.append({
    institution_id: Joi.string().required(),
    aggregatorId: Joi.number().required(),
    aggregator_institution_id: Joi.string().required(),
  });

export interface DecodedToken {
  permissions: string[];
  "ucw/appMetaData": {
    aggregatorId: string;
  };
}

export const createValidateUserCanActOnInstitution =
  (
    validateFunction: ({
      institutionId,
      req,
    }: {
      institutionId: string;
      req: Request;
    }) => Promise<true | ActOnInstitutionValidationErrorReason>,
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const canUserActOnInstitution = await validateFunction({
      institutionId: req?.params?.id,
      req,
    });

    const errorMap = {
      [ActOnInstitutionValidationErrorReason.GenericError]: {
        error: "Error validating user permission",
        status: 500,
      },
      [ActOnInstitutionValidationErrorReason.InsufficientScope]: {
        error: "Insufficient permissions",
        status: 403,
      },
      [ActOnInstitutionValidationErrorReason.InvalidInstitutionId]: {
        error: "Institution not found",
        status: 404,
      },
      [ActOnInstitutionValidationErrorReason.UsedByOtherAggregators]: {
        error:
          "Aggregator cannot edit an institution used by other aggregators",
        status: 403,
      },
    };

    if (canUserActOnInstitution === true) {
      return next();
    }

    const { error, status } =
      errorMap[canUserActOnInstitution] ||
      errorMap[ActOnInstitutionValidationErrorReason.GenericError];

    return res.status(status).json({
      error,
    });
  };

export const validateUserCanEditInstitution =
  createValidateUserCanActOnInstitution(editInstitutionValidation);
export const validateUserCanDeleteInstitution =
  createValidateUserCanActOnInstitution(deleteInstitutionValidation);

const createValidateUserCanDoActionOnAggregatorIntegration =
  (
    validateFunction: ({
      aggregatorIntegrationId,
      req,
    }: {
      aggregatorIntegrationId: string;
      req: Request;
    }) => Promise<true | ActOnAggregatorIntegrationValidationErrorReason>,
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const canUserEditAggregatorIntegration = await validateFunction({
      aggregatorIntegrationId: req?.params?.id,
      req,
    });

    const errorMap = {
      [ActOnAggregatorIntegrationValidationErrorReason.GenericError]: {
        error: "Error validating user permission",
        status: 500,
      },
      [ActOnAggregatorIntegrationValidationErrorReason.InsufficientScope]: {
        error: "Insufficient permissions",
        status: 403,
      },
      [ActOnAggregatorIntegrationValidationErrorReason.InvalidAggregatorIntegrationId]:
        {
          error: "Aggregator Integration not found",
          status: 404,
        },
      [ActOnAggregatorIntegrationValidationErrorReason.NotYourAggregator]: {
        error:
          "An Aggregator cannot edit or delete an aggregatorIntegration belonging to another aggregator",
        status: 403,
      },
    };

    if (canUserEditAggregatorIntegration === true) {
      return next();
    }

    const { error, status } =
      errorMap[canUserEditAggregatorIntegration] ||
      errorMap[ActOnAggregatorIntegrationValidationErrorReason.GenericError];

    return res.status(status).json({
      error,
    });
  };

export const validateUserCanDeleteAggregatorIntegration =
  createValidateUserCanDoActionOnAggregatorIntegration(deleteAggIntValidation);
export const validateUserCanEditAggregatorIntegration =
  createValidateUserCanDoActionOnAggregatorIntegration(editAggIntValidation);

interface AggregatorIntegrationRequestBody {
  aggregatorId: number;
  institution_id: UUID;
}
export const validateUserCanCreateAggregatorIntegration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")?.[1];
  const decodedToken = jwt.decode(token as string) as DecodedToken;
  const permissions = decodedToken.permissions;
  const aggregatorName = decodedToken["ucw/appMetaData"]?.aggregatorId;

  if (permissions.includes(UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION)) {
    return next();
  } else if (
    !permissions.includes(
      UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
    )
  ) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }

  const aggregators = await Aggregator.findAll({
    where: { name: aggregatorName },
    raw: true,
  });

  const aggregator = aggregators[0];
  if (!aggregator) {
    return res.status(500).json({
      error:
        "This user doesn't have the required aggregatorId in their metadata",
    });
  }
  const aggregatorRequestBody = req.body as AggregatorIntegrationRequestBody;

  if (aggregator.id !== aggregatorRequestBody.aggregatorId) {
    return res.status(403).json({
      error:
        "An Aggregator cannot create an aggregatorIntegration belonging to another aggregator",
    });
  }

  if (aggregator.id === aggregatorRequestBody.aggregatorId) {
    next();
  } else {
    return res.status(403).json({
      error:
        "An Aggregator cannot create an aggregatorIntegration belonging to another aggregator",
    });
  }
};
