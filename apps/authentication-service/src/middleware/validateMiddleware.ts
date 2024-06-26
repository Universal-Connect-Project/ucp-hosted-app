import { RequestHandler } from "express";
import { ObjectSchema } from "yup";

const ReqValidateBody: ReqValidate = (schema) => async (req, res, next) => {
  if (schema.fields && !Object.keys(schema.fields).length) {
    return res
      .status(422)
      .json({ status: 422, errors: "Validator schema empty!" });
  }

  try {
    await schema.validate(req.body);
    return next();
  } catch (errors) {
    return res.status(422).json({ status: 422, errors });
  }
};

type ReqValidate = (schema: ObjectSchema<object>) => RequestHandler;

export const ReqValidate = {
  body: ReqValidateBody,
};
