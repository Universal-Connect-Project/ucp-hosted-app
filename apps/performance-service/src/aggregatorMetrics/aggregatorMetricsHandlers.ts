import { Request, Response } from "express";
import { BUCKET, queryApi } from "../services/influxDb";
import { TimeFrame } from "../shared/consts/timeFrame";
import { getAggregators } from "../shared/requests/getAggregators";
import { Aggregator } from "@repo/shared-utils";

export const getAggregatorMetrics = async (req: Request, res: Response) => {
  try {
    const aggregators = await getAggregators();

    const data = await queryAndTransformAggregatorData(
      (req.query?.timeFrame || "30d") as TimeFrame,
      aggregators,
    );
    res.send({
      aggregators: aggregators.map((aggregator) => ({
        ...aggregator,
        ...data[aggregator.name],
      })),
    });
  } catch (error) {
    res.status(400).json({ error });
  }
};

const queryAndTransformAggregatorData = async (
  timeFrame: TimeFrame,
  aggregators: Aggregator[],
) => {
  const jobTypeInfluxResults = await queryInfluxAggregatorJobTypeAverages(
    timeFrame,
    aggregators,
  );
  const aggregatorInfluxResults = await queryInfluxAggregatorAverages(
    timeFrame,
    aggregators,
  );
  const jsonObject = transformInfluxAggregatorDataToJson(jobTypeInfluxResults);
  return addAggregatorAveragesToJson(aggregatorInfluxResults, jsonObject);
};

const createMetricQuery =
  ({
    measurement,
    resultVariableName,
    value,
  }: {
    measurement: string;
    resultVariableName: string;
    value: string;
  }) =>
  ({
    aggregators,
    shouldGroupByJobType,
    timeFrame,
  }: {
    aggregators: Aggregator[];
    shouldGroupByJobType: boolean;
    timeFrame: TimeFrame;
  }) => `
${resultVariableName} = from(bucket: "${BUCKET}")
  |> range(start: -${timeFrame})
  |> filter(fn: (r) => ${aggregators
    .map(({ name }) => `r.aggregatorId == string(v: "${name}")`)
    .join(" or ")})
  |> filter(fn: (r) => r._measurement == "${measurement}")
  |> group(columns: ["aggregatorId"${shouldGroupByJobType ? ', "jobTypes"' : ""}])
  |> mean()
  |> set(key: "_field", value: "${value}")
`;

const createSuccessRateQuery = createMetricQuery({
  measurement: "successRateMetrics",
  resultVariableName: "successRates",
  value: "avgSuccessRate",
});

const createDurationQuery = createMetricQuery({
  measurement: "durationMetrics",
  resultVariableName: "durations",
  value: "avgDuration",
});

const queryInfluxAggregatorJobTypeAverages = async (
  timeFrame: TimeFrame,
  aggregators: Aggregator[],
): Promise<influxResult[]> => {
  const fluxQuery = `
    ${createSuccessRateQuery({
      aggregators,
      timeFrame,
      shouldGroupByJobType: true,
    })}

    ${createDurationQuery({
      aggregators,
      shouldGroupByJobType: true,
      timeFrame,
    })}

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

const queryInfluxAggregatorAverages = async (
  timeFrame: TimeFrame,
  aggregators: Aggregator[],
) => {
  const fluxQuery = `
    ${createSuccessRateQuery({
      aggregators,
      shouldGroupByJobType: false,
      timeFrame,
    })}

   ${createDurationQuery({
     aggregators,
     shouldGroupByJobType: false,
     timeFrame,
   })}

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
