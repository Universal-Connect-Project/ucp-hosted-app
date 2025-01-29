import { validateAccessToken } from "@repo/backend-utils";
import {
  AUTH0_CLIENT_AUDIENCE,
  AUTH0_WIDGET_AUDIENCE,
  UiUserPermissions,
} from "@repo/shared-utils";
import { UUID } from "crypto";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { Aggregator } from "../../models/aggregator";
import { AggregatorIntegration } from "../../models/aggregatorIntegration";
import { Institution } from "../../models/institution";

export const validateUIAudience = validateAccessToken({
  audience: AUTH0_CLIENT_AUDIENCE,
  auth0Domain: process.env.AUTH0_DOMAIN as string,
});

export const validateWidgetAudience = validateAccessToken({
  audience: AUTH0_WIDGET_AUDIENCE,
  auth0Domain: process.env.AUTH0_DOMAIN as string,
});

export interface DecodedToken {
  permissions: string[];
  "ucw/appMetaData": {
    aggregatorId: string;
  };
}

export enum ActOnInstitutionValidationErrorReason {
  GenericError,
  InsufficientScope,
  InvalidInstitutionId,
  UsedByOtherAggregators,
}

export const createValidateUserCanActOnInstitution =
  ({
    adminPermission,
    aggregatorPermission,
  }: {
    adminPermission: string;
    aggregatorPermission: string;
  }) =>
  async ({ institutionId, req }: { institutionId: string; req: Request }) => {
    try {
      const token = req.headers.authorization?.split(" ")?.[1] as string;
      const decodedToken = jwt.decode(token) as DecodedToken;
      const permissions = decodedToken.permissions;

      if (permissions.includes(adminPermission)) {
        return true;
      } else if (!permissions.includes(aggregatorPermission)) {
        return ActOnInstitutionValidationErrorReason.InsufficientScope;
      }

      const institution = await Institution.findByPk(institutionId);

      if (!institution) {
        return ActOnInstitutionValidationErrorReason.InvalidInstitutionId;
      }

      const aggregatorId = decodedToken["ucw/appMetaData"].aggregatorId;

      const aggregators = await institution?.getAggregators({ raw: true });
      const hasOtherAggregators = aggregators?.some(
        (aggregator) => aggregator.name !== aggregatorId,
      );

      if (hasOtherAggregators) {
        return ActOnInstitutionValidationErrorReason.UsedByOtherAggregators;
      }

      return true;
    } catch {
      return ActOnInstitutionValidationErrorReason.GenericError;
    }
  };

export const validateUserCanEditInstitution =
  createValidateUserCanActOnInstitution({
    adminPermission: UiUserPermissions.UPDATE_INSTITUTION,
    aggregatorPermission: UiUserPermissions.UPDATE_INSTITUTION_AGGREGATOR,
  });

export const validateUserCanDeleteInstitution =
  createValidateUserCanActOnInstitution({
    adminPermission: UiUserPermissions.DELETE_INSTITUTION,
    aggregatorPermission: UiUserPermissions.DELETE_INSTITUTION_AGGREGATOR,
  });

export enum ActOnAggregatorIntegrationValidationErrorReason {
  GenericError,
  InsufficientScope,
  InvalidAggregatorIntegrationId,
  NotYourAggregator,
}

export const createValidateUserCanActOnAggregatorIntegration =
  ({
    adminPermission,
    aggregatorPermission,
  }: {
    adminPermission: string;
    aggregatorPermission: string;
  }) =>
  async ({
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

      if (permissions.includes(adminPermission)) {
        return true;
      } else if (!permissions.includes(aggregatorPermission)) {
        return ActOnAggregatorIntegrationValidationErrorReason.InsufficientScope;
      }

      const aggregatorIntegration = await AggregatorIntegration.findByPk(
        aggregatorIntegrationId,
      );
      if (!aggregatorIntegration) {
        return ActOnAggregatorIntegrationValidationErrorReason.InvalidAggregatorIntegrationId;
      }

      const aggregatorName = decodedToken["ucw/appMetaData"]?.aggregatorId;
      const aggregator = await aggregatorIntegration?.getAggregator();

      if (aggregatorName !== aggregator?.name) {
        return ActOnAggregatorIntegrationValidationErrorReason.NotYourAggregator;
      }

      return true;
    } catch (err) {
      return ActOnAggregatorIntegrationValidationErrorReason.GenericError;
    }
  };

export const validateUserCanEditAggregatorIntegration =
  createValidateUserCanActOnAggregatorIntegration({
    adminPermission: UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION,
    aggregatorPermission:
      UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
  });

export const validateUserCanDeleteAggregatorIntegration =
  createValidateUserCanActOnAggregatorIntegration({
    adminPermission: UiUserPermissions.DELETE_AGGREGATOR_INTEGRATION,
    aggregatorPermission:
      UiUserPermissions.DELETE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
  });

export const getUsersAggregatorIntegrationCreationPermissions = async ({
  institutionId,
  req,
}: {
  institutionId: UUID;
  req: Request;
}) => {
  const noAccessResponse = {
    aggregatorsThatCanBeAdded: [],
  };

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
    const aggregatorIdsForInstitution =
      aggregatorIntegrationsForInstitution.map(
        ({ aggregatorId }) => aggregatorId,
      );

    const aggregatorsWithoutIntegrations = aggregators.filter(
      ({ id }) => !aggregatorIdsForInstitution.includes(id),
    );

    return {
      aggregatorsThatCanBeAdded: aggregatorsWithoutIntegrations,
      hasAccessToAllAggregators: true,
    };
  } else if (
    !permissions.includes(
      UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
    )
  ) {
    return noAccessResponse;
  }

  const aggregatorId = aggregators?.find(
    ({ name }) => name === aggregatorName,
  )?.id;

  if (!aggregatorId) {
    return noAccessResponse;
  }

  const isTheirAggregatorMissingAnIntegration =
    !aggregatorIntegrationsForInstitution.some(
      (aggregatorIntegration) =>
        aggregatorIntegration.aggregatorId === aggregatorId,
    );

  if (isTheirAggregatorMissingAnIntegration) {
    return {
      aggregatorsThatCanBeAdded: aggregators.filter(
        ({ id }) => id === aggregatorId,
      ),
    };
  }

  return noAccessResponse;
};
