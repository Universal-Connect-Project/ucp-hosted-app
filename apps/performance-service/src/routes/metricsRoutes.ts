import {
  NextFunction,
  RequestHandler,
  Router,
  Request,
  Response,
} from "express";
import {
  validateUIAudience,
  validateWidgetAudience,
} from "../middlewares/validationMiddleware";
import { requiredScopes } from "express-oauth2-jwt-bearer";
import { ComboJobTypes, WidgetHostPermissions } from "@repo/shared-utils";
import {
  getAggregatorDurationGraphData,
  getAggregatorSuccessGraphData,
  getPerformanceRoutingJson,
} from "../controllers/metricsController";
import Joi from "joi";
import { TimeFrameAggWindowMap } from "../services/influxQueries/aggregatorGraphMetrics";

const router = Router();

router.get(
  "/allPerformanceData",
  [validateWidgetAudience],
  requiredScopes(WidgetHostPermissions.READ_WIDGET_ENDPOINTS),
  getPerformanceRoutingJson as RequestHandler,
);

const validateAggregatorGraphSchema = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = Joi.object({
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
    aggregators: Joi.string().allow(""),
    timeFrame: Joi.string()
      .allow("")
      .valid(...Object.keys(TimeFrameAggWindowMap)),
  }).validate(req.query);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

router.get(
  "/aggregatorSuccessGraph",
  [validateUIAudience, validateAggregatorGraphSchema],
  getAggregatorSuccessGraphData as RequestHandler,
);

router.get(
  "/aggregatorDurationGraph",
  [validateUIAudience, validateAggregatorGraphSchema],
  getAggregatorDurationGraphData as RequestHandler,
);

export default router;
