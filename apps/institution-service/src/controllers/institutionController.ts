import { UUID } from "crypto";
import { Request, Response } from "express";
import { Op, ValidationError, literal } from "sequelize";
import { Literal } from "sequelize/types/utils";
import { validate } from "uuid";
import db from "../database";
import { Aggregator } from "../models/aggregator";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
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
  [Op.or]?: Array<
    | {
        name?: { [Op.iLike]: string };
      }
    | Literal
  >;
  [Op.and]?: unknown;
};

const getPaginationOptions = (req: Request): PaginationOptions => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit =
    parseInt(req.query.pageSize as string, 10) || DEFAULT_PAGINATION_PAGE_SIZE;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const integrationFilterStrings = (req: Request): string => {
  const {
    supportsIdentification,
    supportsAggregation,
    supportsHistory,
    supportsVerification,
    supportsOauth,
    includeInactiveIntegrations,
    aggregatorName,
  } = req.query;
  const integrationFilterStringList = [];
  if (supportsIdentification === "true") {
    integrationFilterStringList.push(
      'AND "aggregatorIntegration"."supports_identification" = TRUE',
    );
  }
  if (supportsAggregation === "true") {
    integrationFilterStringList.push(
      'AND "aggregatorIntegration"."supports_aggregation" = TRUE',
    );
  }
  if (supportsHistory === "true") {
    integrationFilterStringList.push(
      'AND "aggregatorIntegration"."supports_history" = TRUE',
    );
  }
  if (supportsVerification === "true") {
    integrationFilterStringList.push(
      'AND "aggregatorIntegration"."supports_verification" = TRUE',
    );
  }
  if (supportsOauth === "true") {
    integrationFilterStringList.push(
      'AND "aggregatorIntegration"."supports_oauth" = TRUE',
    );
  }
  if (includeInactiveIntegrations !== "true" && aggregatorName) {
    integrationFilterStringList.push(
      `AND "aggregatorIntegration"."isActive" = TRUE`,
    );
  }

  return integrationFilterStringList.join(" ");
};

const whereInstitutionConditions = (req: Request): WhereConditions => {
  const { search } = req.query;

  const whereConditions: WhereConditions = {};

  if (search) {
    const escapedSearch = db.escape(`%${search as string}%`);

    whereConditions[Op.or] = [
      { name: { [Op.iLike]: `%${search as string}%` } },
      literal(`
        EXISTS (
          SELECT 1 from UNNEST(keywords) as keyword
          WHERE keyword ILIKE ${escapedSearch}
        )
      `),
    ];
  }

  const aggregatorFilter = aggregatorFilterLiteral(req);

  if (aggregatorFilter) {
    whereConditions[Op.and] = aggregatorFilter;
  }

  return whereConditions;
};

const aggregatorFilterLiteral = (req: Request): Literal | null => {
  const { aggregatorName, includeInactiveIntegrations } = req.query;

  let aggQueryFilter = "";
  if (aggregatorName) {
    const aggregatorNames = Array.isArray(aggregatorName)
      ? aggregatorName
      : [aggregatorName];
    const escapedAggregatorNames = aggregatorNames.map((aggregator) => {
      return db.escape(aggregator as string);
    });
    aggQueryFilter = `AND "aggregator"."name" IN (${escapedAggregatorNames.join(", ")})`;
  }

  const integrationFilter = integrationFilterStrings(req);

  if (
    !integrationFilter &&
    !aggQueryFilter &&
    includeInactiveIntegrations === "true"
  ) {
    return null;
  }

  return literal(`
    EXISTS (
      SELECT 1
      FROM "aggregatorIntegrations" AS "aggregatorIntegration"
      INNER JOIN "aggregators" AS "aggregator" 
      ON "aggregatorIntegration"."aggregatorId" = "aggregator"."id"
      WHERE "aggregatorIntegration"."institution_id" = "Institution"."id"
      ${integrationFilter}
      ${aggQueryFilter}
    )
  `);
};

export const getPaginatedInstitutions = async (req: Request, res: Response) => {
  try {
    const { limit, offset, page } = getPaginationOptions(req);

    const { count, rows } = await Institution.findAndCountAll({
      distinct: true,
      attributes: [
        "id",
        "name",
        "keywords",
        "logo",
        "url",
        "is_test_bank",
        "routing_numbers",
        "createdAt",
        "updatedAt",
      ],
      where: whereInstitutionConditions(req),
      include: [
        {
          model: AggregatorIntegration,
          as: "aggregatorIntegrations",
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
          required: false,
          include: [
            {
              model: Aggregator,
              as: "aggregator",
              attributes: ["name", "id", "displayName", "logo"],
              required: false,
            },
          ],
        },
      ],
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
      institutions: rows,
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

export const deleteInstitution = async (req: Request, res: Response) => {
  try {
    await Institution.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(204).json({});
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the institution" });
  }
};
