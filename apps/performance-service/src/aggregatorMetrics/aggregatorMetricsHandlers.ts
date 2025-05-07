import { Request, Response } from "express";
import { BUCKET, queryApi } from "../services/influxDb";
import { TimeFrame } from "../aggregatorGraphMetrics/aggregatorGraphInfluxQueries";

export const getAggregatorMetrics = async (req: Request, res: Response) => {
  try {
    const data = await queryAndTransformAggregatorData(
      (req.query?.timeFrame || "30d") as TimeFrame,
    );
    res.send(data);
  } catch (error) {
    res.status(400).json({ error });
  }
};

const queryAndTransformAggregatorData = async (timeFrame: TimeFrame) => {
  const jobTypeInfluxResults =
    await queryInfluxAggregatorJobTypeAverages(timeFrame);
  const aggregatorInfluxResults =
    await queryInfluxAggregatorAverages(timeFrame);
  const jsonObject = transformInfluxAggregatorDataToJson(jobTypeInfluxResults);
  return addAggregatorAveragesToJson(aggregatorInfluxResults, jsonObject);
};

const queryInfluxAggregatorJobTypeAverages = async (
  timeFrame: TimeFrame,
): Promise<influxResult[]> => {
  const fluxQuery = `
    successRates = from(bucket: "${BUCKET}")
      |> range(start: -${timeFrame})
      |> filter(fn: (r) => r._measurement == "successRateMetrics")
      |> group(columns: ["aggregatorId", "jobTypes"])
      |> mean()
      |> rename(columns: {_value: "avgSuccessRate"})

    durations = from(bucket: "${BUCKET}")
      |> range(start: -${timeFrame})
      |> filter(fn: (r) => r._measurement == "durationMetrics")
      |> group(columns: ["aggregatorId", "jobTypes"])
      |> mean()
      |> rename(columns: {_value: "avgDuration"})

    join(tables: {success: successRates, duration: durations}, on: ["aggregatorId", "jobTypes"])
      |> group(columns: ["aggregatorId"])
    `;

  return await queryApi.collectRows(fluxQuery);
};

const queryInfluxAggregatorAverages = async (timeFrame: TimeFrame) => {
  const fluxQuery = `
    successRates = from(bucket: "${BUCKET}")
      |> range(start: -${timeFrame})
      |> filter(fn: (r) => r._measurement == "successRateMetrics")
      |> group(columns: ["aggregatorId"])
      |> mean()
      |> rename(columns: {_value: "avgSuccessRate"})

    durations = from(bucket: "${BUCKET}")
      |> range(start: -${timeFrame})
      |> filter(fn: (r) => r._measurement == "durationMetrics")
      |> group(columns: ["aggregatorId"])
      |> mean()
      |> rename(columns: {_value: "avgDuration"})

    join(tables: {success: successRates, duration: durations}, on: ["aggregatorId"])
        |> group(columns: ["aggregatorId"])
    `;

  const results: influxResult[] = await queryApi.collectRows(fluxQuery);
  return results;
};

interface influxResult {
  aggregatorId: string;
  jobTypes: string;
  avgDuration: number;
  avgSuccessRate: number;
}

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

const transformInfluxAggregatorDataToJson = (data: influxResult[]) => {
  const jsonOutput: AggregatorMetrics = {};

  data.forEach((row) => {
    const { aggregatorId, jobTypes, avgDuration, avgSuccessRate } = row;

    if (!jsonOutput[aggregatorId]) {
      jsonOutput[aggregatorId] = {
        avgSuccessRate: undefined,
        avgDuration: undefined,
        jobTypes: {},
      };
    }

    jsonOutput[aggregatorId].jobTypes[jobTypes] = {
      avgDuration: avgDuration / 1000,
      avgSuccessRate: avgSuccessRate * 100,
    };
  });
  return jsonOutput;
};

const addAggregatorAveragesToJson = (
  data: influxResult[],
  jsonObject: AggregatorMetrics,
) => {
  data.forEach((row) => {
    const { aggregatorId, avgDuration, avgSuccessRate } = row;

    jsonObject[aggregatorId]["avgDuration"] = avgDuration / 1000;
    jsonObject[aggregatorId]["avgSuccessRate"] = avgSuccessRate * 100;
  });

  return jsonObject;
};
