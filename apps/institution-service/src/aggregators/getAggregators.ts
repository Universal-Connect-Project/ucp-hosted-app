import { Request, Response } from "express";
import { Aggregator } from "../models/aggregator";

export const getAggregators = async (req: Request, res: Response) => {
  try {
    const aggregators = await Aggregator.findAll({
      order: [
        ["displayName", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    res.status(200).json({
      aggregators,
    });
  } catch (_error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching aggregators." });
  }
};
