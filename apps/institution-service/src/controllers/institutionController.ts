import { UUID } from "crypto";
import { Request, Response } from "express";
import { Op, ValidationError, literal } from "sequelize";
import { validate } from "uuid";
import db from "../database";
import { Aggregator } from "../models/aggregator";
import { Institution } from "../models/institution";
import { transformInstitutionToCachedInstitution } from "../services/institutionService";
import { DEFAULT_PAGINATION_PAGE_SIZE } from "../shared/const";
import {
  getUsersAggregatorIntegrationCreationPermissions,
  validateUserCanDeleteAggregatorIntegration,
  validateUserCanEditAggregatorIntegration,
  validateUserCanEditInstitution,
} from "../shared/utils/permissionValidation";

export const getInstitutionCachedList = async (req: Request, res: Response) => {
  try {
    const institutions = await Institution.findAll({
      include: [
        {
          association: Institution.associations.aggregatorIntegrations,
          attributes: [
            ["aggregator_institution_id", "id"],
            "supports_oauth",
            "supports_identification",
            "supports_verification",
            "supports_aggregation",
            "supports_history",
          ],
          where: {
            isActive: true,
          },
          include: [
            {
              model: Aggregator,
              as: "aggregator",
              attributes: ["name", "id"],
            },
          ],
        },
      ],
    });

    const cachedInstitutionList = institutions.map(
      transformInstitutionToCachedInstitution,
    );

    res.status(200);
    res.json(cachedInstitutionList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ error: "Error getting all Institutions" });
  }
};

export const createInstitution = async (req: Request, res: Response) => {
  try {
    const institution = await Institution.create(req.body as Institution);

    res
      .status(201)
      .json({ institution, message: "Institution successfully created" });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: "Invalid Institution Data",
        message: error.errors[0]?.message,
      });
    } else {
      res.status(400).json({ error: error });
    }
  }
};

interface updateInstitutionParams {
  name: string;
  keywords: string[];
  logo: string;
  url: string;
  is_test_bank: boolean;
  routing_numbers: string[];
}

export const updateInstitution = async (req: Request, res: Response) => {
  try {
    const institutionId = req.params.id;
    const updateData = req.body as updateInstitutionParams;

    if (!validate(institutionId)) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const institution = await Institution.findByPk(institutionId);

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    await institution.update(updateData);

    return res
      .status(200)
      .json({ message: "Institution updated successfully", institution });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while updating the institution" });
  }
};

export interface AggregatorIntegrationResponse {
  aggregator_institution_id: string;
  id: number;
  supports_oauth: boolean;
  supports_identification: boolean;
  supports_verification: boolean;
  supports_aggregation: boolean;
  supports_history: boolean;
  isActive: boolean;
  aggregator: {
    name: string;
    id: number;
    displayName: string | null;
    logo: string | null;
  };
}

export interface InstitutionDetail {
  id: string;
  name: string;
  keywords: string[];
  logo: string;
  url: string;
  is_test_bank: boolean;
  routing_numbers: string[];
  createdAt: string;
  updatedAt: string;
  aggregatorIntegrations: AggregatorIntegrationResponse[];
}

interface AggregatorIntegrationPermissions {
  canDelete: boolean;
  canEdit: boolean;
}

export interface InstitutionPermissions {
  aggregatorIntegrationPermissionsMap: Record<
    string,
    AggregatorIntegrationPermissions
  >;
  aggregatorsThatCanBeAdded: Aggregator[];
  canEditInstitution: boolean;
  hasAccessToAllAggregators?: boolean;
}

export interface InstitutionResponse {
  institution: InstitutionDetail;
  permissions: InstitutionPermissions;
}

export interface PaginatedInstitutionsResponse {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  institutions: InstitutionDetail[];
}

interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

type WhereConditions = {
  [key: string]: unknown;
  [Op.or]?: Array<{
    name?: { [Op.iLike]: string };
    keywords?: { [Op.contains]: string[] };
  }>;
  [Op.and]?: unknown;
};

const getPaginationOptions = (req: Request): PaginationOptions => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit =
    parseInt(req.query.pageSize as string, 10) || DEFAULT_PAGINATION_PAGE_SIZE;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const whereAggregatorIntegrationConditions = (req: Request) => {
  const {
    supportsIdentification,
    supportsAggregation,
    supportsHistory,
    supportsVerification,
    supportsOauth,
    isActive,
  } = req.query;
  const whereConditions: WhereConditions = {};
  if (supportsIdentification === "true") {
    whereConditions["supports_identification"] = true;
  }
  if (supportsAggregation === "true") {
    whereConditions["supports_aggregation"] = true;
  }
  if (supportsHistory === "true") {
    whereConditions["supports_history"] = true;
  }
  if (supportsVerification === "true") {
    whereConditions["supports_verification"] = true;
  }
  if (supportsOauth === "true") {
    whereConditions["supports_oauth"] = true;
  }
  if (isActive) {
    whereConditions["isActive"] = isActive === "true" ? true : false;
  }

  return whereConditions;
};

const whereInstitutionConditions = (req: Request): WhereConditions => {
  const { search, aggregatorName } = req.query;

  const whereConditions: WhereConditions = {};

  if (search) {
    whereConditions[Op.or] = [
      { name: { [Op.iLike]: `%${search as string}%` } },
      { keywords: { [Op.contains]: [search as string] } },
    ];
  }

  if (aggregatorName) {
    const aggregatorNames = Array.isArray(aggregatorName)
      ? aggregatorName
      : [aggregatorName];
    const escapedAggregatorNames = aggregatorNames.map((aggregator) => {
      return db.escape(aggregator as string);
    });
    const aggQueryString = `(${escapedAggregatorNames.join(", ")})`;
    const aggCount = escapedAggregatorNames.length;

    whereConditions[Op.and] = literal(`
        EXISTS (
          SELECT COUNT(*)
          FROM "aggregatorIntegrations" AS "aggregatorIntegration"
          INNER JOIN "aggregators" AS "aggregator" ON "aggregatorIntegration"."aggregatorId" = "aggregator"."id"
          WHERE "aggregatorIntegration"."institution_id" = "Institution"."id"
          AND "aggregator"."name" IN ${aggQueryString}
          HAVING COUNT(*) = ${aggCount}
        )
      `);
  }
  return whereConditions;
};

export const getPaginatedInstitutions = async (req: Request, res: Response) => {
  try {
    const { limit, offset, page } = getPaginationOptions(req);

    const { count, rows: institutions } = await Institution.findAndCountAll({
      where: whereInstitutionConditions(req),
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
            "isActive",
          ],
          where: whereAggregatorIntegrationConditions(req),
          include: [
            {
              model: Aggregator,
              as: "aggregator",
              attributes: ["name", "id", "displayName", "logo"],
            },
          ],
        },
      ],
      distinct: true,
      limit,
      offset,
      order: [
        ["createdAt", "DESC"],
        ["name", "ASC"],
      ],
    });

    return res.status(200).json({
      currentPage: page,
      pageSize: limit,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
      institutions,
    } as unknown as PaginatedInstitutionsResponse);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while fetching institutions." });
  }
};

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
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while requesting the institution" });
  }
};
