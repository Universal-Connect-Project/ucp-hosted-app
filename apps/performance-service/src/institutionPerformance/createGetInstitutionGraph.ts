import { Request, Response } from "express";
import { TimeFrame } from "../shared/consts/timeFrame";
import { getGraphMetrics } from "../shared/utils/graphInfluxQueries";

interface GetInstitutionMetricsQueryParams {
  aggregators?: string;
  jobTypes?: string | undefined;
  timeFrame?: TimeFrame;
}

export const createGetInstitutionGraph =
  (metric: "successRateMetrics" | "durationMetrics") =>
  async (req: Request, res: Response) => {
    const { institutionId } = req.params;
    const { timeFrame, jobTypes, aggregators } =
      req.query as GetInstitutionMetricsQueryParams;

    try {
      const data = await getGraphMetrics({
        aggregators: aggregators || undefined,
        institutionId,
        jobTypes: jobTypes || undefined,
        metric,
        timeFrame: timeFrame || "30d",
      });
      res.send(data);
    } catch (error) {
      res.status(400).json({ error });
    }
  };
