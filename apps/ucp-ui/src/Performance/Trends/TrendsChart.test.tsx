import React from "react";
import {
  expectSkeletonLoader,
  render,
  screen,
  userEvent,
  waitFor,
} from "../../shared/test/testUtils";
import { TZDate } from "@date-fns/tz";
import {
  AGGREGATOR_SUCCESS_GRAPH_URL,
  useGetAggregatorSuccessGraphDataQuery,
} from "./api";
import TrendsChart, { formatTooltip } from "./TrendsChart";
import {
  oneDayOption,
  thirtyDaysOption,
} from "../../shared/components/Forms/constants";
import {
  TREND_CHART_TOOLTIP_TEST_ID,
  TRENDS_CHART_ERROR_TEXT,
} from "./constants";
import { server } from "../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { TRY_AGAIN_BUTTON_TEXT } from "../../shared/components/constants";
import { successGraphData } from "../../shared/test/testData/performanceGraphs";

const EDTTimeZone = "America/New_York";

const start = new TZDate("2023-10-01T12:00:00Z", EDTTimeZone);
const dateWithinSameMinute = new TZDate("2023-10-01T12:00:04Z", EDTTimeZone);
const stop = new TZDate("2023-10-01T12:01:00Z", EDTTimeZone);

const militaryTimeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const monthDayRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;

const title = "Test title";
const tooltipTitle = "Test tooltip";

const TestComponent = ({ timeFrame }: { timeFrame: string }) => {
  const { data, isError, isFetching, refetch } =
    useGetAggregatorSuccessGraphDataQuery({ aggregators: [], timeFrame });

  return (
    <TrendsChart
      data={data}
      isError={isError}
      isFetching={isFetching}
      refetch={() => void refetch()}
      timeFrame={timeFrame}
      title={title}
      tooltipTitle={tooltipTitle}
      valueMultiplier={100}
      valuePostfix="s"
      yAxisMax={1}
    />
  );
};

describe("<TrendsChart />", () => {
  describe("formatTooltip", () => {
    it("formats the tooltip with hours and minutes when start and stop are not within the same minute", () => {
      expect(
        formatTooltip({
          start,
          stop,
        }),
      ).toEqual("10/01 @ 8:00 - 10/01 @ 8:01");
    });

    it("adds seconds to the tooltip when start and stop are within the same minute", () => {
      expect(
        formatTooltip({
          start,
          stop: dateWithinSameMinute,
        }),
      ).toEqual("10/01 @ 8:00:00 - 10/01 @ 8:00:04");
    });
  });

  it("renders the y axis using the valueMultiplier and renders the title and tooltip", async () => {
    render(<TestComponent timeFrame={oneDayOption.value} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();

    await userEvent.hover(screen.getByTestId(TREND_CHART_TOOLTIP_TEST_ID));
    expect(await screen.findByText(tooltipTitle)).toBeInTheDocument();
  });

  it("shows hourly ticks for the one day time frame", async () => {
    render(<TestComponent timeFrame={oneDayOption.value} />);

    expect(
      (await screen.findAllByText(militaryTimeRegex)).length,
    ).toBeGreaterThanOrEqual(2);

    expect(screen.queryByText(monthDayRegex)).not.toBeInTheDocument();
  });

  it("shows daily ticks for other time frames", async () => {
    render(<TestComponent timeFrame={thirtyDaysOption.value} />);

    expect(
      (await screen.findAllByText(monthDayRegex)).length,
    ).toBeGreaterThanOrEqual(2);

    expect(screen.queryByText(militaryTimeRegex)).not.toBeInTheDocument();
  });

  it("shows a loading state and renders an invisible skeleton loader", async () => {
    render(<TestComponent timeFrame={thirtyDaysOption.value} />);

    expect(screen.getByText("Loading data…")).toBeInTheDocument();
    await expectSkeletonLoader();
  });

  it("shows an error state and allows retry", async () => {
    server.use(
      http.get(
        AGGREGATOR_SUCCESS_GRAPH_URL,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(<TestComponent timeFrame={thirtyDaysOption.value} />);
    expect(
      await screen.findByText(TRENDS_CHART_ERROR_TEXT),
    ).toBeInTheDocument();

    server.use(
      http.get(AGGREGATOR_SUCCESS_GRAPH_URL, () =>
        HttpResponse.json(successGraphData),
      ),
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: TRY_AGAIN_BUTTON_TEXT,
      }),
    );

    await waitFor(() =>
      expect(
        screen.queryByText(TRENDS_CHART_ERROR_TEXT),
      ).not.toBeInTheDocument(),
    );
  });
});
