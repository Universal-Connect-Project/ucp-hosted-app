import { TimeFrameToAggregateWindowMap } from "@repo/backend-utils/src/constants";
import { BUCKET, queryApi } from "../../services/influxDb";
import groupBy from "lodash.groupby";
import { GraphMetricsResponse, PerformanceDataPoint } from "@repo/shared-utils";
import { TimeFrame } from "../consts/timeFrame";
import { getAggregators } from "../requests/getAggregators";
import intersection from "lodash.intersection";

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
): PerformanceDataPoint[] => {
  const groupedByAggregatorId = groupBy(dataPoints, "aggregatorId");

  const aggregatorIds = Object.keys(groupedByAggregatorId);

  const firstAggregatorId = aggregatorIds[0];
  const firstAggregatorDataPoints = groupedByAggregatorId[firstAggregatorId];

  return (
    firstAggregatorDataPoints?.map(({ _start, _stop }, index) =>
      aggregatorIds.reduce(
        (acc, aggregatorId) => ({
          ...acc,
          [aggregatorId]: groupedByAggregatorId[aggregatorId][index]._value,
        }),
        { start: _start, midpoint: getMidpoint(_start, _stop), stop: _stop },
      ),
    ) || []
  );
};

const getFilteredAggregators = async (aggregators: string | undefined) => {
  const institutionServiceAggregatorsWithIndexes = (await getAggregators()).map(
    (aggregator, index) => ({
      ...aggregator,
      aggregatorIndex: index,
    }),
  );

  const institutionServiceAggregatorNames =
    institutionServiceAggregatorsWithIndexes.map(({ name }) => name);

  const aggregatorsToFilter = aggregators
    ? intersection(institutionServiceAggregatorNames, aggregators.split(","))
    : institutionServiceAggregatorNames;

  return institutionServiceAggregatorsWithIndexes.filter(({ name }) =>
    aggregatorsToFilter.includes(name),
  );
};

export async function getGraphMetrics({
  aggregators,
  institutionId,
  jobTypes,
  metric,
  timeFrame,
}: {
  institutionId?: string;
  aggregators?: string | undefined;
  jobTypes?: string | undefined;
  metric: "successRateMetrics" | "durationMetrics";
  timeFrame: TimeFrame;
}): Promise<GraphMetricsResponse> {
  const filteredAggregators = await getFilteredAggregators(aggregators);

  if (!filteredAggregators.length) {
    return {
      aggregators: [],
      performance: [],
    };
  }

  const formattedJobTypes = jobTypes
    ?.split(",")
    .map((jobType) => jobType.split("|").sort().join("|"));

  const jobTypesFilter = formattedJobTypes?.length
    ? `|> filter(fn: (r) => ${formattedJobTypes.map((type) => `r.jobTypes == string(v: "${type}")`).join(" or ")})`
    : "";

  const aggregatorFilter = filteredAggregators?.length
    ? `|> filter(fn: (r) => ${filteredAggregators
        .map(({ name }) => `r.aggregatorId == string(v: "${name}")`)
        .join(" or ")})`
    : "";

  const institutionFilter = institutionId
    ? `|> filter(fn: (r) => r.institutionId == string(v: "${institutionId}"))`
    : "";

  const fluxQuery = `
    import "timezone"

    option location = timezone.location(name: "America/New_York")

    from(bucket: "${BUCKET}")
      |> range(start: -${timeFrame})
      |> filter(fn: (r) => r._measurement == "${metric}")
      ${institutionFilter}
      ${aggregatorFilter}
      ${jobTypesFilter}
      |> group(columns: ["aggregatorId"])
      |> window(every: ${TimeFrameToAggregateWindowMap[timeFrame]}, createEmpty: true, location: location)
      |> mean()
  `;

  const results: AggSuccessInfluxObj[] = await queryApi.collectRows(fluxQuery);

  return {
    aggregators: filteredAggregators,
    performance: transformInfluxGraphMetrics(results),
  };
}
