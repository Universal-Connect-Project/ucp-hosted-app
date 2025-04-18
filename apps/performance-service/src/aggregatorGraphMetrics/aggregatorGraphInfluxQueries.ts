import { TimeFrameToAggregateWindowMap } from "@repo/backend-utils/src/constants";
import { BUCKET, queryApi } from "../services/influxDb";

export type TimeFrame = keyof typeof TimeFrameToAggregateWindowMap;

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
      |> aggregateWindow(every: ${TimeFrameToAggregateWindowMap[timeFrame]}, fn: mean, createEmpty: false)
  `;
  const results: AggSuccessInfluxObj[] = await queryApi.collectRows(fluxQuery);

  return transformInfluxGraphMetrics(results);
}
