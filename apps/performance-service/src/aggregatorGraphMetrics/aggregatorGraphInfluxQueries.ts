import { TimeFrameToAggregateWindowMap } from "@repo/backend-utils/src/constants";
import { BUCKET, queryApi } from "../services/influxDb";
import groupBy from "lodash.groupby";
import { GraphMetricsResponse } from "@repo/shared-utils";

export type TimeFrame = keyof typeof TimeFrameToAggregateWindowMap;

interface AggSuccessInfluxObj {
  result: string;
  aggregatorId: string;
  _start: string;
  _stop: string;
  _value: number;
}

const getMidpoint = (start: string, end: string) => {
  const startDate = new Date(start);

  const difference = (new Date(end).getTime() - startDate.getTime()) / 2;

  return new Date(startDate.getTime() + difference).toISOString();
};

const transformInfluxGraphMetrics = (
  dataPoints: AggSuccessInfluxObj[],
): GraphMetricsResponse => {
  const groupedByAggregatorId = groupBy(dataPoints, "aggregatorId");

  const aggregatorIds = Object.keys(groupedByAggregatorId);

  const firstAggregatorId = aggregatorIds[0];
  const firstAggregatorDataPoints = groupedByAggregatorId[firstAggregatorId];

  const performance =
    firstAggregatorDataPoints?.map(({ _start, _stop }, index) =>
      aggregatorIds.reduce(
        (acc, aggregatorId) => ({
          ...acc,
          [aggregatorId]: groupedByAggregatorId[aggregatorId][index]._value,
        }),
        { start: _start, midpoint: getMidpoint(_start, _stop), stop: _stop },
      ),
    ) || [];

  return { performance };
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
}): Promise<GraphMetricsResponse> {
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
    import "timezone"

    option location = timezone.location(name: "America/New_York")

    from(bucket: "${BUCKET}")
      |> range(start: -${timeFrame})
      |> filter(fn: (r) => r._measurement == "${metric}")
      ${aggregatorFilter}
      ${jobTypesFilter}
      |> group(columns: ["aggregatorId"])
      |> window(every: ${TimeFrameToAggregateWindowMap[timeFrame]}, createEmpty: true, location: location)
      |> mean()
  `;

  const results: AggSuccessInfluxObj[] = await queryApi.collectRows(fluxQuery);

  return transformInfluxGraphMetrics(results);
}
