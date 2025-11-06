import { Request, Response } from "express";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import {
  getAggregatorNameFromRequest,
  getPermissionsFromRequest,
} from "../shared/utils/permissionValidation";
import { UiUserPermissions } from "@repo/shared-utils";
import { Aggregator } from "../models/aggregator";

export interface PatchAggregatorInstitutionRequest extends Request {
  body: {
    isReviewed: boolean;
  };
  params: {
    aggregatorId: string;
    aggregatorInstitutionId: string;
  };
}

const withValidateUserHasPermission =
  (
    handler: (
      req: PatchAggregatorInstitutionRequest,
      res: Response,
    ) => Promise<void>,
  ) =>
  async (req: PatchAggregatorInstitutionRequest, res: Response) => {
    const permissions = getPermissionsFromRequest(req);

    if (
      !permissions.includes(UiUserPermissions.UPDATE_AGGREGATOR_INSTITUTION) &&
      !permissions.includes(
        UiUserPermissions.UPDATE_AGGREGATOR_INSTITUTION_AS_AGGREGATOR,
      )
    ) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    if (
      permissions.includes(
        UiUserPermissions.UPDATE_AGGREGATOR_INSTITUTION_AS_AGGREGATOR,
      )
    ) {
      const aggregatorName = getAggregatorNameFromRequest(req);

      const { aggregatorId } = req.params;

      const aggregator = await Aggregator.findOne({
        where: { id: aggregatorId },
      });

      if (!aggregator || aggregator.name !== aggregatorName) {
        return res.status(403).json({
          error:
            "An aggregator admin can't update a different aggregator's institution",
        });
      }
    }

    return handler(req, res);
  };

const patchAggregatorInstitutionNoChecks = async (
  req: PatchAggregatorInstitutionRequest,
  res: Response,
) => {
  try {
    const {
      body: { isReviewed },
      params: { aggregatorId, aggregatorInstitutionId },
    } = req;

    const aggregatorInstitution = await AggregatorInstitution.findOne({
      where: {
        id: aggregatorInstitutionId,
        aggregatorId,
      },
    });

    if (!aggregatorInstitution) {
      res.status(404).json({ message: "Aggregator Institution not found" });
      return;
    }

    if (isReviewed === true) {
      aggregatorInstitution.reviewedAt = new Date();
    } else {
      aggregatorInstitution.reviewedAt = null;
    }

    await aggregatorInstitution.save();

    res.json({ aggregatorInstitution });
    return;
  } catch (error) {
    console.error("Error patching Aggregator Institution:", error);
    res.status(500).json({ message: "Failed to patch aggregator institution" });
    return;
  }
};

export const patchAggregatorInstitution = withValidateUserHasPermission(
  patchAggregatorInstitutionNoChecks,
);
