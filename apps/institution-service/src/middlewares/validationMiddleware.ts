import { UiUserPermissions } from "@repo/shared-utils";
import { NextFunction, Request, Response } from "express";
import Joi, { ObjectSchema } from "joi";
import jwt from "jsonwebtoken";
import { Aggregator } from "../models/aggregator";
import {
  createValidateUserCanActOnAggregatorIntegration,
  EditAggregatorIntegrationValidationErrorReason,
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

export const validateUserCanEditInstitution = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const canUserEditInstitution = await editInstitutionValidation({
    institutionId: req?.params?.id,
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

export const validateUserCanEditAggregatorIntegration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validateUserCanEdit =
    createValidateUserCanDoActionOnAggregatorIntegration({
      adminPermission: UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION,
      aggregatorPermission:
        UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
    });
  await validateUserCanEdit(req, res, next);
};

export const validateUserCanDeleteAggregatorIntegration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validateUserCanDelete =
    createValidateUserCanDoActionOnAggregatorIntegration({
      adminPermission: UiUserPermissions.DELETE_AGGREGATOR_INTEGRATION,
      aggregatorPermission:
        UiUserPermissions.DELETE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
    });
  await validateUserCanDelete(req, res, next);
};

const createValidateUserCanDoActionOnAggregatorIntegration =
  ({
    adminPermission,
    aggregatorPermission,
  }: {
    adminPermission: string;
    aggregatorPermission: string;
  }) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const validateFunction = createValidateUserCanActOnAggregatorIntegration({
      adminPermission,
      aggregatorPermission,
    });

    const canUserEditAggregatorIntegration = await validateFunction({
      aggregatorIntegrationId: req?.params?.id,
      req,
    });

    const errorMap = {
      [EditAggregatorIntegrationValidationErrorReason.GenericError]: {
        error: "Error validating user permission",
        status: 500,
      },
      [EditAggregatorIntegrationValidationErrorReason.InsufficientScope]: {
        error: "Insufficient permissions",
        status: 403,
      },
      [EditAggregatorIntegrationValidationErrorReason.InvalidAggregatorIntegrationId]:
        {
          error: "Aggregator Integration not found",
          status: 404,
        },
      [EditAggregatorIntegrationValidationErrorReason.NotYourAggregator]: {
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
      errorMap[EditAggregatorIntegrationValidationErrorReason.GenericError];

    return res.status(status).json({
      error,
    });
  };

interface AggregatorIntegrationRequestBody {
  aggregatorId: number;
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

  if (aggregator.id === aggregatorRequestBody.aggregatorId) {
    next();
  } else {
    return res.status(403).json({
      error:
        "An Aggregator cannot create an aggregatorIntegration belonging to another aggregator",
    });
  }
};
