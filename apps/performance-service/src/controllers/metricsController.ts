import { Request, Response } from "express";
import {
  getAggregatorMetrics,
  getAndTransformAllInstitutionMetrics,
  type TimeFrame,
} from "../services/influxDb";

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

interface AggregatorGraphFilterQueryParams {
  timeFrame?: TimeFrame;
  aggregators?: string;
  jobTypes?: string | undefined;
}

export const getAggregatorSuccessGraphData = async (
  req: Request,
  res: Response,
) => {
  const { timeFrame, aggregators, jobTypes } =
    req.query as unknown as AggregatorGraphFilterQueryParams;

  try {
    const successData = await getAggregatorMetrics({
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
    const durationData = await getAggregatorMetrics({
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
