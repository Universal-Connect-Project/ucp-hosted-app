import { Request, Response } from "express";
import { Aggregator } from "../models/aggregator";
import { PERFORMANCE_SERVICE_URL } from "../shared/environment";
import { getPerformanceServiceAccessToken } from "./getPerformanceServiceAccessToken";

export const getAggregatorsWithPerformance = async (
  req: Request,
  res: Response,
) => {
  try {
    const aggregators = await Aggregator.findAll({
      order: [
        ["displayName", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    try {
      const { timeFrame } = req.query as { timeFrame: string | undefined };
      const withPerformanceMetrics = await includeAggregatorPerformance(
        aggregators,
        timeFrame,
      );
      res.status(200).json({
        aggregators: withPerformanceMetrics,
      });
    } catch (error) {
      const err = error as Error;

      res.status(503).json({
        error: err.message,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching aggregators." });
  }
};

const includeAggregatorPerformance = async (
  aggregators: Aggregator[],
  timeFrame: string | undefined,
) => {
  const performance = await getAggregatorPerformance(timeFrame || "30d");
  return aggregators.map((aggregator) => {
    const aggPerformance = performance[aggregator.name];
    return {
      ...aggregator.dataValues,
      avgSuccessRate: aggPerformance?.avgSuccessRate ?? null,
      avgDuration: aggPerformance?.avgDuration || null,
      jobTypes: aggPerformance?.jobTypes || {},
    };
  });
};

interface JobSpecificData {
  avgSuccessRate: number;
  avgDuration: number;
}

interface IndividualAggregatorMetrics {
  avgSuccessRate: number | undefined;
  avgDuration: number | undefined;
  jobTypes: Record<string, JobSpecificData>;
}

type AggregatorMetrics = Record<string, IndividualAggregatorMetrics>;

const getAggregatorPerformance = async (
  timeFrame: string,
): Promise<AggregatorMetrics> => {
  const token = await getPerformanceServiceAccessToken();
  const params = new URLSearchParams({ timeFrame });

  const response = await fetch(
    `${PERFORMANCE_SERVICE_URL}/metrics/aggregators?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const errorData: { error: string } = await response.json();

    throw new Error(errorData.error);
  }

  return (await response.json()) as AggregatorMetrics;
};
