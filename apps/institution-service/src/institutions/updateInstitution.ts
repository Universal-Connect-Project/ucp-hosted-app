import { Request, Response } from "express";
import { validate } from "uuid";
import { Institution } from "../models/institution";

interface updateInstitutionParams {
  name: string;
  keywords: string[];
  logo: string;
  url: string;
  is_test_bank: boolean;
  routing_numbers: string[];
}

export const updateInstitution = async (req: Request, res: Response) => {
  try {
    const institutionId = req.params.id;
    const updateData = req.body as updateInstitutionParams;

    if (!validate(institutionId)) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const institution = await Institution.findByPk(institutionId);

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    await institution.update(updateData);

    return res
      .status(200)
      .json({ message: "Institution updated successfully", institution });
  } catch (_error) {
    return res
      .status(500)
      .json({ error: "An error occurred while updating the institution" });
  }
};
