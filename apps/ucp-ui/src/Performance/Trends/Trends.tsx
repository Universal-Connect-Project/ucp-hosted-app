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

// const getSeries = ({
//   data,
//   dates,
// }: {
//   data?: AggregatorSuccessGraphResponse;
//   dates: string[];
// }) => {
//   if (!data) {
//     return [];
//   }

//   const aggregators = Object.keys(data);

//   const aggregatorDateValueMap: Record<
//     string,
//     Record<string, string>
//   > = aggregators.reduce(
//     (acc, aggregator) => ({
//       ...acc,
//       [aggregator]: data[aggregator].reduce(
//         (acc, { start, value }) => ({
//           ...acc,
//           [start]: value * 100,
//         }),
//         {},
//       ),
//     }),
//     {},
//   );

//   return aggregators.map((aggregator) => ({
//     data: dates.map(
//       (date) => aggregatorDateValueMap[aggregator]?.[date] || null,
//     ),
//     label: aggregator,
//     valueFormatter: (value: number) =>
//       (value ?? null) !== null ? `${formatMaxTwoDecimals(value)}%` : null,
//   }));
// };

const Trends = () => {
  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();

  const { data } = useGetAggregatorSuccessGraphDataQuery({ timeFrame });

  const xAxis = [
    {
      dataKey: "midpoint",
      // data: uniqueDates.map((date) => new Date(date)),
      valueFormatter: (value: Date, context: { location: string }) => {
        if (context.location === "tick") {
          return format(value, "MM/dd");
        } else if (context.location === "tooltip") {
          // return "in tooltip bro";
          return format(value, "MM/dd");
        }
      },
    },
  ];

  const yAxis = [
    {
      max: 1,
      min: 0,
      valueFormatter: (value: number) => value * 100,
    },
  ];

  const series = data?.aggregatorIds?.map((aggregatorId) => ({
    dataKey: aggregatorId,
    label: aggregatorId,
    valueFormatter: (value: number) =>
      (value ?? null) !== null ? `${formatMaxTwoDecimals(value * 100)}%` : null,
  }));

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Trends</Typography>
      <Stack direction="column" spacing={2}>
        <TimeFrameSelect onChange={handleTimeFrameChange} value={timeFrame} />
      </Stack>
      {data && (
        <LineChart
          dataset={data.performance.map(
            ({ midpoint, start, stop, ...rest }) => ({
              ...rest,
              midpoint: new Date(midpoint),
              start: new Date(start),
              stop: new Date(stop),
            }),
          )}
          height={400}
          series={series}
          xAxis={xAxis}
          yAxis={yAxis}
        />
      )}
    </Stack>
  );
};

export default Trends;
