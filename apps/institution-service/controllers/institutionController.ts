import { Request, Response } from "express";
import { ValidationError } from "sequelize";
import { Institution } from "../models/institution";

export const getAllInstitutions = async (req: Request, res: Response) => {
  try {
    const institutions = await Institution.findAll();
    res.status(200);
    res.json(institutions);
  } catch (error) {
    res.status(400).json({ error: "Error getting all Institutions" });
  }
};

export const getInstitutionById = async (req: Request, res: Response) => {
  try {
    const institution = await Institution.findByPk(req.params.id, {
      include: [Institution.associations.providers],
    });
    if (institution) {
      res.status(200).json(institution);
    } else {
      res.status(404).json({ error: "Institution not found" });
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

export const createInstitution = async (req: Request, res: Response) => {
  try {
    const institution = await Institution.create(req.body);

    res.status(201).json(institution);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: "Invalid Institution Data",
        message: error.errors[0]?.message,
      });
    } else {
      res.status(400).json({ error: "Unexpected error" });
    }
  }
};

export const deleteInstitution = async (req: Request, res: Response) => {
  const institution = await Institution.findByPk(req.params.id);

  if (await institution?.destroy()) {
    res.status(204);
    res.json({ message: "Institution deleted" });
  } else {
    res.status(400);
    res.json({ message: "Failure to delete" });
  }
};
