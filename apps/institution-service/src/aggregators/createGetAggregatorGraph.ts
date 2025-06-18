import { Request, Response } from "express";
import { Aggregator } from "../models/aggregator";
import { createGetAggregatorGraphFromPerformanceService } from "./createGetAggregatorGraphFromPerformanceService";

export const createGetAggregatorGraph =
  (url: string) => async (req: Request, res: Response) => {
    try {
      const aggregatorsData = await Aggregator.findAll({
        order: [
          ["displayName", "ASC"],
          ["createdAt", "DESC"],
        ],
      });

      const aggregatorsWithIndexes = aggregatorsData.map(
        (aggregator, index) => ({
          ...aggregator.dataValues,
          aggregatorIndex: index,
        }),
      );

      const { aggregators, jobTypes, timeFrame } = req.query as {
        aggregators: string | undefined;
        jobTypes: string | undefined;
        timeFrame: string | undefined;
      };

      const aggregatorsFromQueryParam = aggregators && aggregators?.split(",");

      const filteredAggregators = aggregatorsFromQueryParam?.length
        ? aggregatorsWithIndexes.filter((aggregator) =>
            aggregatorsFromQueryParam.includes(aggregator.name),
          )
        : aggregatorsWithIndexes;

      const getGraphFromPerformanceService =
        createGetAggregatorGraphFromPerformanceService(url);

      const successGraphResults = await getGraphFromPerformanceService({
        aggregators: filteredAggregators.map((agg) => agg.name).join(","),
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
