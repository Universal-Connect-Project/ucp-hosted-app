import { Request, Response } from "express";
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