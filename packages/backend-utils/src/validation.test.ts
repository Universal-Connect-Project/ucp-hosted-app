import { validateRequestBody } from "./validation";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

describe("validateRequestBody middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  const schema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().integer().min(18).required(),
  });

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should call next() when request body is valid", () => {
    req.body = { name: "John Doe", age: 25 };

    validateRequestBody(schema)(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should return 400 status and error message when request body is invalid", () => {
    req.body = { name: "John Doe" }; // Missing 'age' field

    validateRequestBody(schema)(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining('"age" is required'),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 status and correct error message for invalid type", () => {
    req.body = { name: "John Doe", age: "not-a-number" }; // Invalid type for age

    validateRequestBody(schema)(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining('"age" must be a number'),
    });
    expect(next).not.toHaveBeenCalled();
  });
});
