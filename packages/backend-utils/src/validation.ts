import { NextFunction, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import Joi, { ObjectSchema } from "joi";
import { ComboJobTypes } from "@repo/shared-utils";
import { TimeFrameToAggregateWindowMap } from "./constants";

export const validateAccessToken = ({
  audience,
  auth0Domain,
}: {
  audience: string | string[];
  auth0Domain: string;
}) =>
  auth({
    audience: audience,
    issuerBaseURL: `https://${auth0Domain}`,
    tokenSigningAlg: "RS256",
  });

export const createRequestBodySchemaValidator = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    next();
  };
};

export const createRequestQueryParamSchemaValidator =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    next();
  };

export const validateAggregatorRequestSchema =
  createRequestQueryParamSchemaValidator(
    Joi.object({
      timeFrame: Joi.string()
        .allow("")
        .valid(...Object.keys(TimeFrameToAggregateWindowMap)),
    }),
  );

export const validateAggregatorGraphRequestSchema =
  createRequestQueryParamSchemaValidator(
    Joi.object({
      aggregators: Joi.string().allow(""),
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
      timeFrame: Joi.string()
        .allow("")
        .valid(...Object.keys(TimeFrameToAggregateWindowMap)),
    }),
  );
