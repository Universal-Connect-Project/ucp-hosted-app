import { Request, Response } from "express";
import { Institution } from "../models/institution";

export const deleteInstitution = async (req: Request, res: Response) => {
  try {
    const institutionId = req.params.id;

    const institution = await Institution.findByPk(institutionId);

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    await Institution.destroy({
      where: {
        id: institutionId,
      },
    });

    res.status(204).json({});
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the institution" });
  }
};
