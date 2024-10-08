import { UUID } from "crypto";
import { Request, Response } from "express";
import { ValidationError } from "sequelize";
import { validate } from "uuid";
import { Aggregator } from "../models/aggregator";
import { Institution } from "../models/institution";
import { transformInstitutionToCachedInstitution } from "../services/institutionService";
import { DEFAULT_PAGINATION_PAGE_SIZE } from "../shared/const";
import {
  validateUserCanCreateAggregatorIntegration,
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

    res.status(201).json(institution);
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

interface AggregatorIntegration {
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
  aggregatorIntegrations: AggregatorIntegration[];
}

export interface AggregatorIntegrationWithPermissions
  extends AggregatorIntegration {
  canEditAggregatorIntegration: boolean;
  canDeleteAggregatorIntegration: boolean;
}

export interface InstitutionDetailWithPermissions extends InstitutionDetail {
  canCreateAggregatorIntegration: boolean;
  canEditInstitution: boolean;
  aggregatorIntegrations: AggregatorIntegrationWithPermissions[];
}

export interface InstitutionResponse {
  institution: InstitutionDetailWithPermissions;
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

const getPaginationOptions = (req: Request): PaginationOptions => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit =
    parseInt(req.query.pageSize as string, 10) || DEFAULT_PAGINATION_PAGE_SIZE;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const getPaginatedInstitutions = async (req: Request, res: Response) => {
  try {
    const { limit, offset, page } = getPaginationOptions(req);

    const { count, rows: institutions } = await Institution.findAndCountAll({
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

    const institutionWithPermissions = {
      ...institutionJson,
      canEditInstitution:
        (await validateUserCanEditInstitution({
          institutionId,
          req,
        })) === true,
      canCreateAggregatorIntegration:
        await validateUserCanCreateAggregatorIntegration({
          institutionId: institution.id as UUID,
          req,
        }),
      aggregatorIntegrations: await Promise.all(
        institutionJson.aggregatorIntegrations?.map(async (integration) => ({
          ...integration,
          canEditAggregatorIntegration:
            (await validateUserCanEditAggregatorIntegration({
              aggregatorIntegrationId: `${integration.id}`,
              req,
            })) === true,
          canDeleteAggregatorIntegration:
            (await validateUserCanDeleteAggregatorIntegration({
              aggregatorIntegrationId: `${integration.id}`,
              req,
            })) === true,
        })),
      ),
    };

    return res.status(200).json({ institution: institutionWithPermissions });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while requesting the institution" });
  }
};
