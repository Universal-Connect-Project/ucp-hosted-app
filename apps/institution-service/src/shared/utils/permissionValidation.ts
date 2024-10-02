import {
  AUTH0_CLIENT_AUDIENCE,
  AUTH0_WIDGET_AUDIENCE,
  UiUserPermissions,
} from "@repo/shared-utils";
import jwt from "jsonwebtoken";
import { auth } from "express-oauth2-jwt-bearer";
import { Institution } from "../../models/institution";
import { Request } from "express";

const validateAccessToken = (audience: string | undefined) =>
  auth({
    audience: audience,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: "RS256",
  });

export const validateUIAudience = validateAccessToken(AUTH0_CLIENT_AUDIENCE);

export const validateWidgetAudience = validateAccessToken(
  AUTH0_WIDGET_AUDIENCE,
);

export interface DecodedToken {
  permissions: string[];
  "ucw/appMetaData": {
    aggregatorId: string;
  };
}

export enum EditInstitutionValidationErrorReason {
  GenericError,
  InsufficientScope,
  InvalidInstitutionId,
  UsedByOtherAggregators,
}

export const validateUserCanEditInstitution = async ({
  institutionId,
  req,
}: {
  institutionId: string;
  req: Request;
}) => {
  try {
    const token = req.headers.authorization?.split(" ")?.[1] as string;
    const decodedToken = jwt.decode(token) as DecodedToken;
    const permissions = decodedToken.permissions;

    if (permissions.includes(UiUserPermissions.UPDATE_INSTITUTION)) {
      return true;
    } else if (
      !permissions.includes(UiUserPermissions.UPDATE_INSTITUTION_AGGREGATOR)
    ) {
      return EditInstitutionValidationErrorReason.InsufficientScope;
    }

    const institution = await Institution.findByPk(institutionId);

    if (!institution) {
      return EditInstitutionValidationErrorReason.InvalidInstitutionId;
    }

    const aggregatorId = decodedToken["ucw/appMetaData"].aggregatorId;

    const aggregators = await institution?.getAggregators({ raw: true });
    const hasOtherAggregators = aggregators?.some(
      (aggregator) => aggregator.name !== aggregatorId,
    );

    if (hasOtherAggregators) {
      return EditInstitutionValidationErrorReason.UsedByOtherAggregators;
    }

    return true;
  } catch {
    return EditInstitutionValidationErrorReason.GenericError;
  }
};
