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
      |> set(key: "_field", value: "avgSuccessRate")

    durations = from(bucket: "${BUCKET}")
      |> range(start: -${timeFrame})
      |> filter(fn: (r) => r._measurement == "durationMetrics")
      |> group(columns: ["aggregatorId", "jobTypes"])
      |> mean()
      |> set(key: "_field", value: "avgDuration")

    union(tables: [successRates, durations])
      |> pivot(
          rowKey: ["aggregatorId", "jobTypes"],
          columnKey: ["_field"],
          valueColumn: "_value"
      )
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
      |> set(key: "_field", value: "avgSuccessRate")

    durations = from(bucket: "${BUCKET}")
      |> range(start: -${timeFrame})
      |> filter(fn: (r) => r._measurement == "durationMetrics")
      |> group(columns: ["aggregatorId"])
      |> mean()
      |> set(key: "_field", value: "avgDuration")

    union(tables: [successRates, durations])
      |> pivot(
          rowKey: ["aggregatorId"],
          columnKey: ["_field"],
          valueColumn: "_value"
      )
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
  avgDuration: number | undefined;
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
      avgDuration: avgDuration ? avgDuration / 1000 : undefined,
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

    jsonObject[aggregatorId]["avgDuration"] = avgDuration
      ? avgDuration / 1000
      : undefined;
    jsonObject[aggregatorId]["avgSuccessRate"] = avgSuccessRate * 100;
  });

  return jsonObject;
};
