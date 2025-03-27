import { Request, Response } from "express";
import { getAndTransformAllInstitutionMetrics } from "./performanceRoutingInfluxQueries";

export const getPerformanceRoutingJson = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await getAndTransformAllInstitutionMetrics();
    res.send(data);
  } catch (error) {
    res.status(400).json({ error });
  }
};
