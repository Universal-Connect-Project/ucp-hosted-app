import React from "react";
import { Stack, Typography } from "@mui/material";
import TimeFrameSelect, {
  useTimeFrameSelect,
} from "../../shared/components/Forms/TimeFrameSelect";
import {
  AggregatorSuccessGraphResponse,
  useGetAggregatorSuccessGraphDataQuery,
} from "./api";
import { LineChart } from "@mui/x-charts";
import { formatMaxTwoDecimals } from "../../shared/utils/format";
import { format } from "date-fns";

const getUniqueDates = (data?: AggregatorSuccessGraphResponse): string[] => {
  if (!data) {
    return [];
  }

  const allDates = Object.values(data)
    .flat()
    .map(({ date }) => date);

  const uniqueDates = new Set();

  allDates.forEach((date) => uniqueDates.add(date));

  return Array.from(uniqueDates).sort((a, b) => {
    return new Date(a as string).getTime() - new Date(b as string).getTime();
  }) as string[];
};

const getSeries = ({
  data,
  dates,
}: {
  data?: AggregatorSuccessGraphResponse;
  dates: string[];
}) => {
  if (!data) {
    return [];
  }

  const aggregators = Object.keys(data);

  const aggregatorDateValueMap: Record<
    string,
    Record<string, string>
  > = aggregators.reduce(
    (acc, aggregator) => ({
      ...acc,
      [aggregator]: data[aggregator].reduce(
        (acc, { date, value }) => ({
          ...acc,
          [date]: value * 100,
        }),
        {},
      ),
    }),
    {},
  );

  return aggregators.map((aggregator) => ({
    data: dates.map(
      (date) => aggregatorDateValueMap[aggregator]?.[date] || null,
    ),
    valueFormatter: (value: number) => `${formatMaxTwoDecimals(value)}%`,
  }));
};

const Trends = () => {
  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();

  const { data } = useGetAggregatorSuccessGraphDataQuery({ timeFrame });

  const uniqueDates = getUniqueDates(data);

  const xAxis = [
    {
      data: uniqueDates.map((date) => new Date(date)),
      valueFormatter: (value: Date) => format(value, "MM/dd"),
    },
  ];
  const series = getSeries({ data, dates: uniqueDates });

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Trends</Typography>
      <Stack direction="column" spacing={2}>
        <TimeFrameSelect onChange={handleTimeFrameChange} value={timeFrame} />
      </Stack>
      {data && <LineChart height={400} series={series} xAxis={xAxis} />}
    </Stack>
  );
};

export default Trends;
