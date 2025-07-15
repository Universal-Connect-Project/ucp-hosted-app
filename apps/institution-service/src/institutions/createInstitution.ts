import { Request, Response } from "express";
import { Institution } from "../models/institution";
import { ValidationError } from "sequelize";

export const createInstitution = async (req: Request, res: Response) => {
  try {
    const institution = await Institution.create(req.body as Institution);

    res
      .status(201)
      .json({ institution, message: "Institution successfully created" });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: "Invalid Institution Data",
        message: error.errors[0]?.message,
      });
    } else {
      res.status(400).json({ error: error });
    }
  }
};
