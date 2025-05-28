import React from "react";
import { Stack, Typography } from "@mui/material";
import TimeFrameSelect, {
  useTimeFrameSelect,
} from "../../shared/components/Forms/TimeFrameSelect";
import { useGetAggregatorSuccessGraphDataQuery } from "./api";
import { LineChart } from "@mui/x-charts";
import { formatMaxTwoDecimals } from "../../shared/utils/format";
import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";

const EDTTimeZone = "America/New_York";

const formatTooltip = (date: Date) => format(date, "MM/dd @ H:mm");

const Trends = () => {
  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();

  const { data } = useGetAggregatorSuccessGraphDataQuery({ timeFrame });
  const performanceData = data?.performance?.map(
    ({ midpoint, start, stop, ...rest }) => ({
      ...rest,
      midpoint: new TZDate(midpoint, EDTTimeZone),
      start: new TZDate(start, EDTTimeZone),
      stop: new TZDate(stop, EDTTimeZone),
    }),
  );
  const midpointToStartAndEndMap = performanceData?.reduce(
    (acc, { midpoint, start, stop }) => ({
      ...acc,
      [midpoint.getTime()]: {
        start,
        stop,
      },
    }),
    {},
  );

  const xAxis = [
    {
      dataKey: "midpoint",
      // data: uniqueDates.map((date) => new Date(date)),
      valueFormatter: (value: Date, context: { location: string }) => {
        if (context.location === "tick") {
          return format(value, "MM/dd");
        } else if (context.location === "tooltip") {
          const { start, stop } = midpointToStartAndEndMap?.[
            value.getTime()
          ] as {
            start: Date;
            stop: Date;
          };

          return `${formatTooltip(start)} - ${formatTooltip(stop)}`;
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
          dataset={performanceData}
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
