import { getPerformanceDataByConnectionId } from "../services/influxDb";
import { Request, Response } from "express";

export const getConnectionPerformanceData = async (
  req: Request,
  res: Response,
) => {
  try {
    const { connectionId } = req.params;

    const performanceData =
      await getPerformanceDataByConnectionId(connectionId);

    if (!performanceData) {
      res.status(404).json({
        error: "No performance data found for the specified connection ID",
      });
      return;
    }

    res.status(200).json(performanceData);
  } catch (error) {
    console.error("Error retrieving performance data:", error);
    res.status(500).json({
      error: "Failed to retrieve performance data",
    });
  }
};
