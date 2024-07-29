import { Request, Response } from "express";
import { Institution } from "../models/institution";

export const getAllInstitutions = async (req: Request, res: Response) => {
  const institutions = await Institution.findAll();
  res.json(institutions);
};

export const getInstitutionById = async (req: Request, res: Response) => {
  const institution = await Institution.findByPk(req.params.id, {
    include: [Institution.associations.providers],
  });
  res.json(institution);
};

export const createInstitution = async (req: Request, res: Response) => {
  try {
    const institution = await Institution.create(req.body);

    res.status(201).json(institution);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to create institution" });
  }
};

export const deleteInstitution = async (req: Request, res: Response) => {
  const institution = await Institution.findByPk(req.params.id);

  if (await institution?.destroy()) {
    res.status(204);
    res.json({ message: "Institution deleted" });
  } else {
    res.status(400);
    res.send("Failure to delete");
  }
};
