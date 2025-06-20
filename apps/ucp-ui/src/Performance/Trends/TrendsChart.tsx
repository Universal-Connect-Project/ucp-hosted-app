import React from "react";
import { AggregatorGraphMetricsResponse } from "@repo/shared-utils";
import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";
import {
  LineChart,
  LineSeriesType,
  rainbowSurgePaletteLight,
} from "@mui/x-charts";
import { formatMaxTwoDecimals } from "../../shared/utils/format";
import { Paper, Stack, Tooltip, Typography } from "@mui/material";
import styles from "./trendsChart.module.css";
import { InfoOutline } from "@mui/icons-material";
import FetchError from "../../shared/components/FetchError";
import {
  TREND_CHART_TOOLTIP_TEST_ID,
  TRENDS_CHART_ERROR_TEXT,
} from "./constants";
import { oneDayOption } from "../../shared/components/Forms/constants";
import { InvisibleLoader } from "../../shared/components/Skeleton";

const chartColors = rainbowSurgePaletteLight;

const EDTTimeZone = "America/New_York";

export const formatTooltip = ({ start, stop }: { start: Date; stop: Date }) => {
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

const TrendsChart = ({
  data,
  isError,
  isFetching,
  refetch,
  timeFrame,
  tooltipTitle,
  title,
  valueMultiplier,
  valuePostfix,
  yAxisMax,
}: {
  data: AggregatorGraphMetricsResponse | undefined;
  isError: boolean;
  isFetching: boolean;
  refetch: () => void;
  timeFrame: string;
  title: string;
  tooltipTitle: string;
  valueMultiplier: number;
  valuePostfix: string;
  yAxisMax?: number;
}) => {
  const shouldUseHourlyTicks = timeFrame === oneDayOption.value;

  const performanceData =
    data?.performance?.map(({ midpoint, start, stop, ...rest }) => {
      const midpointDate = new TZDate(midpoint, EDTTimeZone);

      return {
        ...rest,
        midpoint: midpointDate,
        start: new TZDate(start, EDTTimeZone),
        stop: new TZDate(stop, EDTTimeZone),
      };
    }) || [];
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
      max: yAxisMax,
      min: 0,
      valueFormatter: (value: number) => `${value * valueMultiplier}`,
    },
  ];

  const series: LineSeriesType[] =
    data?.aggregators?.map(({ aggregatorIndex, displayName, name }) => ({
      color: chartColors[aggregatorIndex],
      curve: "linear",
      dataKey: name,
      label: displayName,
      labelMarkType: "square",
      type: "line",
      valueFormatter: (value: number | null) =>
        value !== null
          ? `${formatMaxTwoDecimals(value * valueMultiplier)}${valuePostfix}`
          : null,
    })) || [];

  return (
    <Paper className={styles.chartContainer} variant="outlined">
      {isFetching && <InvisibleLoader />}
      <Stack spacing={3}>
        {isError && (
          <FetchError description={TRENDS_CHART_ERROR_TEXT} refetch={refetch} />
        )}
        <Stack alignItems="center" direction="row" spacing={1.5}>
          <Typography variant="h6">{title}</Typography>
          <Tooltip title={tooltipTitle}>
            <InfoOutline
              color="primary"
              data-testid={TREND_CHART_TOOLTIP_TEST_ID}
            />
          </Tooltip>
        </Stack>
        <LineChart
          dataset={performanceData}
          height={300}
          loading={isFetching}
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
      </Stack>
    </Paper>
  );
};

export default TrendsChart;
