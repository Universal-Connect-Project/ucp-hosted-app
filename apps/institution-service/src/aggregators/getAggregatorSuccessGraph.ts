import { Request, Response } from "express";
import { Aggregator } from "../models/aggregator";
import { getPerformanceServiceAccessToken } from "./getPerformanceServiceAccessToken";
import { PERFORMANCE_SERVICE_URL } from "../shared/environment";
import { GraphMetricsResponse } from "@repo/backend-utils";

const getAggregatorSuccessGraphFromPerformanceService = async ({
  aggregators,
  jobTypes,
  timeFrame,
}: {
  aggregators: string | undefined;
  jobTypes: string | undefined;
  timeFrame: string | undefined;
}): Promise<GraphMetricsResponse> => {
  const token = await getPerformanceServiceAccessToken();
  const queryParams = Object.entries({
    aggregators,
    jobTypes,
    timeFrame,
  }).reduce(
    (acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  const params = new URLSearchParams(queryParams);

  const response = await fetch(
    `${PERFORMANCE_SERVICE_URL}/metrics/aggregatorSuccessGraph?${params.toString()}`,
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

  return (await response.json()) as GraphMetricsResponse;
};

export const getAggregatorSuccessGraph = async (
  req: Request,
  res: Response,
) => {
  try {
    const aggregatorsData = await Aggregator.findAll({
      order: [
        ["displayName", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    const { aggregators, jobTypes, timeFrame } = req.query as {
      aggregators: string | undefined;
      jobTypes: string | undefined;
      timeFrame: string | undefined;
    };

    const aggregatorsFromQueryParam = aggregators && aggregators?.split(",");

    const filteredAggregators = aggregatorsFromQueryParam?.length
      ? aggregatorsData.filter((aggregator) =>
          aggregatorsFromQueryParam.includes(aggregator.name),
        )
      : aggregatorsData;

    const successGraphResults =
      await getAggregatorSuccessGraphFromPerformanceService({
        aggregators: filteredAggregators?.map((a) => a.name).join(","),
        jobTypes,
        timeFrame,
      });

    res.status(200).json({
      aggregators: filteredAggregators,
      performance: successGraphResults.performance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching aggregators." });
  }
};
