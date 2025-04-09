import { ComboJobTypes } from "@repo/shared-utils";
import {
  NextFunction,
  RequestHandler,
  Router,
  Request,
  Response,
} from "express";
import Joi from "joi";

import { validateUIAudience } from "../middlewares/validationMiddleware";
import {
  getAggregatorSuccessGraphData,
  getAggregatorDurationGraphData,
} from "./aggregatorGraphHandlers";
import { TimeFrameToAggregateWindowMap } from "@repo/backend-utils/src/constants";

const router = Router();

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
      .valid(...Object.keys(TimeFrameToAggregateWindowMap)),
  }).validate(req.query);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

router.get(
  "/metrics/aggregatorSuccessGraph",
  [validateUIAudience, validateAggregatorGraphSchema],
  getAggregatorSuccessGraphData as RequestHandler,
);

router.get(
  "/metrics/aggregatorDurationGraph",
  [validateUIAudience, validateAggregatorGraphSchema],
  getAggregatorDurationGraphData as RequestHandler,
);

export default router;
