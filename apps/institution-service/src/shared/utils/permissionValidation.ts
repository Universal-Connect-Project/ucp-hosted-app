import {
  AUTH0_CLIENT_AUDIENCE,
  AUTH0_WIDGET_AUDIENCE,
  UiUserPermissions,
} from "@repo/shared-utils";
import jwt from "jsonwebtoken";
import { auth } from "express-oauth2-jwt-bearer";
import { Institution } from "../../models/institution";
import { Request } from "express";
import { AggregatorIntegration } from "../../models/aggregatorIntegration";
import { UUID } from "crypto";
import { Aggregator } from "../../models/aggregator";

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

export enum EditAggregatorIntegrationValidationErrorReason {
  GenericError,
  InsufficientScope,
  InvalidAggregatorIntegrationId,
  NotYourAggregator,
}

export const validateUserCanEditAggregatorIntegration = async ({
  aggregatorIntegrationId,
  req,
}: {
  aggregatorIntegrationId: string;
  req: Request;
}) => {
  try {
    const token = req.headers.authorization?.split(" ")?.[1];
    const decodedToken = jwt.decode(token as string) as DecodedToken;
    const permissions = decodedToken.permissions;

    if (permissions.includes(UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION)) {
      return true;
    } else if (
      !permissions.includes(
        UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
      )
    ) {
      return EditAggregatorIntegrationValidationErrorReason.InsufficientScope;
    }

    const aggregatorIntegration = await AggregatorIntegration.findByPk(
      aggregatorIntegrationId,
    );
    if (!aggregatorIntegration) {
      return EditAggregatorIntegrationValidationErrorReason.InvalidAggregatorIntegrationId;
    }

    const aggregatorName = decodedToken["ucw/appMetaData"]?.aggregatorId;
    const aggregator = await aggregatorIntegration?.getAggregator();

    if (aggregatorName !== aggregator?.name) {
      return EditAggregatorIntegrationValidationErrorReason.NotYourAggregator;
    }

    return true;
  } catch (err) {
    return EditAggregatorIntegrationValidationErrorReason.GenericError;
  }
};

export const validateUserCanCreateAggregatorIntegration = async ({
  institutionId,
  req,
}: {
  institutionId: UUID;
  req: Request;
}) => {
  const token = req.headers.authorization?.split(" ")?.[1];
  const decodedToken = jwt.decode(token as string) as DecodedToken;
  const permissions = decodedToken.permissions;
  const aggregatorName = decodedToken["ucw/appMetaData"]?.aggregatorId;

  const aggregators = await Aggregator.findAll({
    raw: true,
  });

  const aggregatorIntegrationsForInstitution =
    await AggregatorIntegration.findAll({
      where: {
        institution_id: institutionId,
      },
      raw: true,
    });

  if (permissions.includes(UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION)) {
    const areThereAnyAggregatorsWithoutIntegrations =
      aggregators.length > aggregatorIntegrationsForInstitution.length;

    return areThereAnyAggregatorsWithoutIntegrations;
  } else if (
    !permissions.includes(
      UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
    )
  ) {
    return false;
  }

  const aggregatorId = aggregators?.find(
    ({ name }) => name === aggregatorName,
  )?.id;

  if (!aggregatorId) {
    return false;
  }

  const isTheirAggregatorMissingAnIntegration =
    !aggregatorIntegrationsForInstitution.some(
      (aggregatorIntegration) =>
        aggregatorIntegration.aggregatorId === aggregatorId,
    );

  return isTheirAggregatorMissingAnIntegration;
};
