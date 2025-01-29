import { validateAccessToken } from "@repo/backend-utils";
import { AUTH0_WIDGET_AUDIENCE } from "@repo/shared-utils";
import Joi from "joi";
import "../dotEnv";

export const validateWidgetAudience = validateAccessToken({
  audience: AUTH0_WIDGET_AUDIENCE,
  auth0Domain: process.env.AUTH0_DOMAIN as string,
});

export const startEventSchema = Joi.object({
  jobType: Joi.string()
    .valid("aggregation", "verification", "identity", "fullhistory", "all")
    .required(),
  institutionId: Joi.string().required(),
  aggregatorId: Joi.string().required(),
  clientId: Joi.string().required(),
});
