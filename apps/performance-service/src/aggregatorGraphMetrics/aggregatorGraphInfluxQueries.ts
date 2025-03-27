import { BUCKET, queryApi } from "../services/influxDb";

export const TimeFrameAggWindowMap = {
  "1d": "1h",
  "1w": "12h",
  "30d": "1d",
  "180d": "12d",
  "1y": "30d",
};

export type TimeFrame = keyof typeof TimeFrameAggWindowMap;

interface AggSuccessInfluxObj {
  result: string;
  _time: Date;
  aggregatorId: string;
  _value: number;
}

const transformInfluxGraphMetrics = (dataPoints: AggSuccessInfluxObj[]) => {
  const aggregatorsPoints: Record<string, { date: Date; value: number }[]> = {};

  dataPoints.forEach((dataPoint) => {
    if (!aggregatorsPoints[dataPoint.aggregatorId]) {
      aggregatorsPoints[dataPoint.aggregatorId] = [];
    }

    aggregatorsPoints[dataPoint.aggregatorId].push({
      date: dataPoint._time,
      value: dataPoint._value,
    });
  });

  return aggregatorsPoints;
};

export async function getAggregatorGraphMetrics({
  timeFrame,
  aggregators,
  jobTypes,
  metric,
}: {
  timeFrame: TimeFrame;
  aggregators?: string | undefined;
  jobTypes?: string | undefined;
  metric: "successRateMetrics" | "durationMetrics";
}) {
  const formattedJobTypes = jobTypes
    ?.split(",")
    .map((jobType) => jobType.split("|").sort().join("|"));
  const jobTypesFilter = formattedJobTypes?.length
    ? `|> filter(fn: (r) => ${formattedJobTypes.map((type) => `r.jobTypes == string(v: "${type}")`).join(" or ")})`
    : "";
  const aggregatorFilter = aggregators?.length
    ? `|> filter(fn: (r) => ${aggregators
        .split(",")
        .map((aggregatorId) => `r.aggregatorId == string(v: "${aggregatorId}")`)
        .join(" or ")})`
    : "";
  const fluxQuery = `
    from(bucket: "${BUCKET}")
      |> range(start: -${timeFrame})
      |> filter(fn: (r) => r._measurement == "${metric}")
      ${aggregatorFilter}
      ${jobTypesFilter}
      |> group(columns: ["aggregatorId"])
      |> aggregateWindow(every: ${TimeFrameAggWindowMap[timeFrame]}, fn: mean, createEmpty: false)
  `;
  const results: AggSuccessInfluxObj[] = await queryApi.collectRows(fluxQuery);

  return transformInfluxGraphMetrics(results);
}
