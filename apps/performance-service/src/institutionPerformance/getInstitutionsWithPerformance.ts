import { Request, Response } from "express";
import { getInstitutions } from "../shared/requests/getInstitutions";

interface QueryParams {
  jobTypes?: string;
  page: string;
  pageSize: string;
  search?: string;
  timeFrame?: string;
}

export const getInstitutionsWithPerformance = async (
  req: Request,
  res: Response,
) => {
  const { jobTypes, page, pageSize, search, timeFrame } =
    req.query as unknown as QueryParams;

  try {
    const institutions = await getInstitutions({
      page,
      pageSize,
      search,
    });

    res.send(institutions);
  } catch (error) {
    res.status(400).send({ error: "Internal Server Error" });
  }
};
