import { NextFunction, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import Joi, { ObjectSchema } from "joi";
import { TimeFrameAggWindowMap } from "./constants";

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

export const validateRequestBody = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    next();
  };
};

export const validateAggregatorRequestSchema = (
  req: Request,
  res: Response,
  next: NextFunction
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
