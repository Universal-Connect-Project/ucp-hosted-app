import { TimeFrameToAggregateWindowMap } from "@repo/backend-utils/src/constants";
import { BUCKET, queryApi } from "../services/influxDb";

export type TimeFrame = keyof typeof TimeFrameToAggregateWindowMap;

interface AggSuccessInfluxObj {
  result: string;
  aggregatorId: string;
  _start: Date;
  _stop: Date;
  _value: number;
}

const transformInfluxGraphMetrics = (dataPoints: AggSuccessInfluxObj[]) => {
  const aggregatorsPoints: Record<
    string,
    { start: Date; stop: Date; value: number }[]
  > = {};

  dataPoints.forEach((dataPoint) => {
    if (!aggregatorsPoints[dataPoint.aggregatorId]) {
      aggregatorsPoints[dataPoint.aggregatorId] = [];
    }

    aggregatorsPoints[dataPoint.aggregatorId].push({
      start: dataPoint._start,
      stop: dataPoint._stop,
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
      |> window(every: ${TimeFrameToAggregateWindowMap[timeFrame]}, createEmpty: true)
      |> mean()
  `;
  const results: AggSuccessInfluxObj[] = await queryApi.collectRows(fluxQuery);

  return transformInfluxGraphMetrics(results);
}
