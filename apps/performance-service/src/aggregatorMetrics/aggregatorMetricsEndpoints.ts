import {
  NextFunction,
  RequestHandler,
  Router,
  Request,
  Response,
} from "express";
import Joi from "joi";
import { TimeFrameAggWindowMap } from "../shared/consts";
import { validateInstitutionServiceAudience } from "../middlewares/validationMiddleware";
import { getAggregatorMetrics } from "./aggregatorMetricsHandlers";

const validateAggregatorMetricsSchema = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = Joi.object({
    timeFrame: Joi.string()
      .allow("")
      .valid(...Object.keys(TimeFrameAggWindowMap)),
  }).validate(req.query);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

const router = Router();

router.get(
  "/metrics/aggregators",
  [validateInstitutionServiceAudience, validateAggregatorMetricsSchema],
  getAggregatorMetrics as RequestHandler,
);

export default router;
