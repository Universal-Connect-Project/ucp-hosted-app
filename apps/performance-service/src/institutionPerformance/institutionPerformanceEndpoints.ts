import { RequestHandler, Router } from "express";
import { validateUIAudience } from "../middlewares/validationMiddleware";
import { getInstitutionSuccessGraph } from "./getInstitutionSuccessGraph";
import {
  createRequestQueryParamSchemaValidator,
  TimeFrameToAggregateWindowMap,
  validatePerformanceGraphRequestSchema,
} from "@repo/backend-utils";
import { getInstitutionDurationGraph } from "./getInstitutionDurationGraph";
import { getInstitutionsWithPerformance } from "./getInstitutionsWithPerformance";
import Joi from "joi";
import { ComboJobTypes } from "@repo/shared-utils";

const router = Router();

router.get(
  "/metrics/institution/:institutionId/successGraph",
  [validateUIAudience, validatePerformanceGraphRequestSchema],
  getInstitutionSuccessGraph as RequestHandler,
);

router.get(
  "/metrics/institution/:institutionId/durationGraph",
  [validateUIAudience, validatePerformanceGraphRequestSchema],
  getInstitutionDurationGraph as RequestHandler,
);

export const validateInstitutionsWithPerformanceQueryParams =
  createRequestQueryParamSchemaValidator(
    Joi.object({
      jobTypes: Joi.string()
        .allow("")
        .custom((value: string, helpers) => {
          const jobTypes = value.split(",");
          const individualJobTypes = jobTypes.flatMap((jobType) =>
            jobType.split("|"),
          );
          const invalidItems = individualJobTypes.filter(
            (item) => !Object.values(ComboJobTypes).includes(item),
          );
          if (invalidItems.length > 0) {
            return helpers.error("any.invalid", { invalid: invalidItems });
          }
        })
        .messages({
          "any.invalid": `"jobTypes" contains invalid values. Valid values include: [${Object.values(ComboJobTypes).join(", ")}] or any combination of these joined by |`,
        }),
      page: Joi.string().required(),
      pageSize: Joi.string().required(),
      search: Joi.string().allow(""),
      sortBy: Joi.string(),
      timeFrame: Joi.string()
        .required()
        .valid(...Object.keys(TimeFrameToAggregateWindowMap)),
    }),
  );

router.get(
  "/metrics/institutions/",
  [validateUIAudience, validateInstitutionsWithPerformanceQueryParams],
  getInstitutionsWithPerformance as RequestHandler,
);

export default router;
