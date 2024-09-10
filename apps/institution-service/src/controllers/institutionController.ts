import { Request, Response } from "express";
import { Institution } from "../models/institution";
import { transformInstitutionToCachedInstitution } from "../services/institutionService";

export const getInstitutionCachedList = async (req: Request, res: Response) => {
  try {
    const institutions = await Institution.findAll({
      include: [
        {
          association: Institution.associations.providers,
          attributes: [
            "name",
            ["provider_institution_id", "id"],
            "supports_oauth",
            "supports_identification",
            "supports_verification",
            "supports_aggregation",
            "supports_history",
          ],
        },
      ],
    });

    const cachedInstitutionList = institutions.map(
      transformInstitutionToCachedInstitution,
    );

    res.status(200);
    res.json(cachedInstitutionList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ error: "Error getting all Institutions" });
  }
};
