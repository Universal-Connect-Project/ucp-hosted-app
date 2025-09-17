import { Request, Response } from "express";
import { getCachedInstitutionList } from "../services/institutionCacheManager";

export const getInstitutionCachedList = async (req: Request, res: Response) => {
  try {
    const cachedInstitutionList = await getCachedInstitutionList();

    res.status(200);
    res.json(cachedInstitutionList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ error: "Error getting all Institutions" });
  }
};
