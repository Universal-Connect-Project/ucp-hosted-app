import React from "react";
import { Stack, Typography } from "@mui/material";
import TimeFrameSelect, {
  useTimeFrameSelect,
} from "../../shared/components/Forms/TimeFrameSelect";
import { useGetAggregatorSuccessGraphDataQuery } from "./api";
import { LineChart, LineSeriesType } from "@mui/x-charts";
import { formatMaxTwoDecimals } from "../../shared/utils/format";
import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { oneDayOption } from "../../shared/components/Forms/constants";

const EDTTimeZone = "America/New_York";

const formatTooltip = ({ start, stop }: { start: Date; stop: Date }) => {
  const formatDate = (date: Date) => format(date, "MM/dd @ H:mm");
  const formatDateWithSeconds = (date: Date) => format(date, "MM/dd @ H:mm:ss");

  let formattedStart = formatDate(start);
  let formattedStop = formatDate(stop);

  if (formattedStart === formattedStop) {
    formattedStart = formatDateWithSeconds(start);
    formattedStop = formatDateWithSeconds(stop);
  }

  return `${formattedStart} - ${formattedStop}`;
};

const Trends = () => {
  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();

  const shouldUseHourlyTicks = timeFrame === oneDayOption.value;

  const { data } = useGetAggregatorSuccessGraphDataQuery({ timeFrame });
  const performanceData = data?.performance?.map(
    ({ midpoint, start, stop, ...rest }) => {
      const midpointDate = new TZDate(midpoint, EDTTimeZone);

      return {
        ...rest,
        midpoint: midpointDate,
        start: new TZDate(start, EDTTimeZone),
        stop: new TZDate(stop, EDTTimeZone),
      };
    },
  );
  const midpointToStartAndEndMap: Record<
    string,
    {
      start: Date;
      stop: Date;
    }
  > =
    performanceData?.reduce(
      (acc, { midpoint, start, stop }) => ({
        ...acc,
        [midpoint.getTime()]: {
          start,
          stop,
        },
      }),
      {},
    ) || {};

  const xAxis = [
    {
      dataKey: "midpoint",
      tickMinStep: shouldUseHourlyTicks ? undefined : 24 * 60 * 60 * 1000,
      valueFormatter: (value: Date, context: { location: string }) => {
        if (context.location === "tick") {
          const date = new TZDate(value, EDTTimeZone);
          if (shouldUseHourlyTicks) {
            return format(date, "H:mm");
          }

          return format(date, "MM/dd");
        } else if (context.location === "tooltip") {
          const { start, stop } = midpointToStartAndEndMap?.[
            value.getTime()
          ] as {
            start: Date;
            stop: Date;
          };

          return formatTooltip({
            start,
            stop,
          });
        }

        return "";
      },
    },
  ];

  const yAxis = [
    {
      max: 1,
      min: 0,
      valueFormatter: (value: number) => `${value * 100}`,
    },
  ];

  const series: LineSeriesType[] =
    data?.aggregators?.map(({ displayName, name }) => ({
      curve: "linear",
      dataKey: name,
      label: displayName,
      labelMarkType: "square",
      type: "line",
      valueFormatter: (value: number | null) =>
        value !== null ? `${formatMaxTwoDecimals(value * 100)}%` : null,
    })) || [];

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
          slotProps={{
            legend: {
              direction: "horizontal",
              position: {
                horizontal: "start",
                vertical: "top",
              },
            },
          }}
          xAxis={xAxis}
          yAxis={yAxis}
        />
      )}
    </Stack>
  );
};

export default Trends;
