import { Request, Response } from "express";
import { getGraphMetrics } from "../shared/utils/graphInfluxQueries";
import { TimeFrame } from "../shared/consts/timeFrame";

interface AggregatorGraphFilterQueryParams {
  aggregators?: string;
  jobTypes?: string | undefined;
  timeFrame?: TimeFrame;
}

export const getAggregatorSuccessGraphData = async (
  req: Request,
  res: Response,
) => {
  const { timeFrame, aggregators, jobTypes } =
    req.query as unknown as AggregatorGraphFilterQueryParams;

  try {
    const successData = await getGraphMetrics({
      timeFrame: timeFrame || "30d",
      aggregators: aggregators || undefined,
      jobTypes: jobTypes || undefined,
      metric: "successRateMetrics",
    });
    res.send(successData);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const getAggregatorDurationGraphData = async (
  req: Request,
  res: Response,
) => {
  const { timeFrame, aggregators, jobTypes } =
    req.query as unknown as AggregatorGraphFilterQueryParams;

  try {
    const durationData = await getGraphMetrics({
      timeFrame: timeFrame || "30d",
      aggregators: aggregators || undefined,
      jobTypes: jobTypes || undefined,
      metric: "durationMetrics",
    });
    res.send(durationData);
  } catch (error) {
    res.status(400).json({ error });
  }
};
