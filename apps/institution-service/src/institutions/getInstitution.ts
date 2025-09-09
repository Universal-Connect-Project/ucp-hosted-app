import { Request, Response } from "express";
import { validate } from "uuid";
import { Institution } from "../models/institution";
import { Aggregator } from "../models/aggregator";
import {
  getUsersAggregatorIntegrationCreationPermissions,
  validateUserCanDeleteAggregatorIntegration,
  validateUserCanDeleteInstitution,
  validateUserCanEditAggregatorIntegration,
  validateUserCanEditInstitution,
} from "../shared/utils/permissionValidation";
import { UUID } from "crypto";
import { InstitutionDetail } from "./consts";

export const getInstitution = async (req: Request, res: Response) => {
  try {
    const institutionId = req.params.id;

    if (!validate(institutionId)) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const institution = await Institution.findByPk(institutionId, {
      include: [
        {
          association: Institution.associations.aggregatorIntegrations,
          attributes: [
            "id",
            "aggregator_institution_id",
            "supports_oauth",
            "supports_identification",
            "supports_verification",
            "supports_aggregation",
            "supports_history",
            "supportsRewards",
            "supportsBalance",
            "createdAt",
            "updatedAt",
            "isActive",
          ],
          include: [
            {
              model: Aggregator,
              as: "aggregator",
              attributes: ["name", "id", "displayName", "logo"],
            },
          ],
        },
      ],
    });

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const institutionJson =
      institution.toJSON() as unknown as InstitutionDetail;

    const aggregatorIntegrationsPermissions = await Promise.all(
      institutionJson.aggregatorIntegrations?.map(async (integration) => ({
        integrationId: integration.id,
        canEdit:
          (await validateUserCanEditAggregatorIntegration({
            aggregatorIntegrationId: `${integration.id}`,
            req,
          })) === true,
        canDelete:
          (await validateUserCanDeleteAggregatorIntegration({
            aggregatorIntegrationId: `${integration.id}`,
            req,
          })) === true,
      })),
    );

    const aggregatorIntegrationPermissionsMap =
      aggregatorIntegrationsPermissions.reduce(
        (acc, { canDelete, canEdit, integrationId }) => ({
          ...acc,
          [integrationId]: {
            canDelete,
            canEdit,
          },
        }),
        {},
      );

    return res.status(200).json({
      institution: institutionJson,
      permissions: {
        aggregatorIntegrationPermissionsMap,
        canDeleteInstitution:
          (await validateUserCanDeleteInstitution({
            institutionId,
            req,
          })) === true,
        canEditInstitution:
          (await validateUserCanEditInstitution({
            institutionId,
            req,
          })) === true,
        ...(await getUsersAggregatorIntegrationCreationPermissions({
          institutionId: institution.id as UUID,
          req,
        })),
      },
    });
  } catch (_error) {
    return res
      .status(500)
      .json({ error: "An error occurred while requesting the institution" });
  }
};
