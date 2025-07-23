import React from "react";
import {
  render,
  screen,
  userEvent,
  waitFor,
} from "../../shared/test/testUtils";
import Trends from "./Trends";
import {
  durationGraphData,
  successGraphData,
} from "../../shared/test/testData/performanceGraphs";
import { server } from "../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import {
  AGGREGATOR_DURATION_GRAPH_URL,
  AGGREGATOR_SUCCESS_GRAPH_URL,
} from "./api";
import { TRENDS_CHART_ERROR_TEXT } from "../../shared/components/trendsChartConstants";
import { TRY_AGAIN_BUTTON_TEXT } from "../../shared/components/constants";
import {
  AGGREGATORS_LABEL_TEXT,
  JOB_TYPES_LABEL_TEXT,
  oneDayOption,
  TIME_FRAME_LABEL_TEXT,
} from "../../shared/components/Forms/constants";
import { aggregatorsResponse } from "../../shared/api/testData/aggregators";
import { supportsJobTypeMap } from "../../shared/constants/jobTypes";

const militaryTimeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const monthDayRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;

describe("<Trends />", () => {
  it("renders a success and duration chart", async () => {
    render(<Trends />);

    expect(
      await screen.findByText(successGraphData.aggregators[0].displayName),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(durationGraphData.aggregators[0].displayName),
    ).toBeInTheDocument();
  });

  it("shows a loading state while fetching data", () => {
    render(<Trends />);

    expect(screen.getAllByText("Loading data…")).toHaveLength(2);
  });

  it("shows an error on success graph failure and allows retry", async () => {
    server.use(
      http.get(
        AGGREGATOR_SUCCESS_GRAPH_URL,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(<Trends />);
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

  it("shows an error on duration graph failure and allows retry", async () => {
    server.use(
      http.get(
        AGGREGATOR_DURATION_GRAPH_URL,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(<Trends />);
    expect(
      await screen.findByText(TRENDS_CHART_ERROR_TEXT),
    ).toBeInTheDocument();

    server.use(
      http.get(AGGREGATOR_DURATION_GRAPH_URL, () =>
        HttpResponse.json(durationGraphData),
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

  it("allows changing the time frame, aggregators, and jobTypes", async () => {
    render(<Trends />);

    let queryParamsFromSuccess;
    let queryParamsFromDuration;

    server.use(
      http.get(AGGREGATOR_DURATION_GRAPH_URL, ({ request }) => {
        const searchParams = new URL(request.url).searchParams;
        queryParamsFromDuration = Object.fromEntries(searchParams.entries());

        return HttpResponse.json(durationGraphData);
      }),
    );
    server.use(
      http.get(AGGREGATOR_SUCCESS_GRAPH_URL, ({ request }) => {
        const searchParams = new URL(request.url).searchParams;
        queryParamsFromSuccess = Object.fromEntries(searchParams.entries());

        return HttpResponse.json(successGraphData);
      }),
    );

    await userEvent.click(screen.getByLabelText(TIME_FRAME_LABEL_TEXT));

    await userEvent.click(
      await screen.findByRole("option", { name: oneDayOption.label }),
    );

    expect(queryParamsFromDuration).toEqual({
      aggregators: "",
      jobTypes: "",
      timeFrame: oneDayOption.value,
    });
    expect(queryParamsFromSuccess).toEqual({
      aggregators: "",
      jobTypes: "",
      timeFrame: oneDayOption.value,
    });

    await userEvent.click(screen.getByLabelText(AGGREGATORS_LABEL_TEXT));

    const { aggregators } = aggregatorsResponse;

    await userEvent.click(
      await screen.findByRole("option", {
        name: aggregators[0].displayName,
      }),
    );

    expect(queryParamsFromDuration).toEqual({
      aggregators: aggregators[0].name,
      jobTypes: "",
      timeFrame: oneDayOption.value,
    });
    expect(queryParamsFromSuccess).toEqual({
      aggregators: aggregators[0].name,
      jobTypes: "",
      timeFrame: oneDayOption.value,
    });

    await userEvent.click(screen.getByLabelText(JOB_TYPES_LABEL_TEXT));

    await userEvent.click(
      await screen.findByRole("option", {
        name: supportsJobTypeMap.transactions.displayName,
      }),
    );

    expect(queryParamsFromDuration).toEqual({
      aggregators: aggregators[0].name,
      jobTypes: "transactions",
      timeFrame: oneDayOption.value,
    });
    expect(queryParamsFromSuccess).toEqual({
      aggregators: aggregators[0].name,
      jobTypes: "transactions",
      timeFrame: oneDayOption.value,
    });
  });

  it("uses hourly ticks for the one day time frame", async () => {
    render(<Trends />);

    await userEvent.click(screen.getByLabelText(TIME_FRAME_LABEL_TEXT));

    await userEvent.click(
      await screen.findByRole("option", { name: oneDayOption.label }),
    );

    expect(
      (await screen.findAllByText(militaryTimeRegex)).length,
    ).toBeGreaterThanOrEqual(4);

    expect(screen.queryByText(monthDayRegex)).not.toBeInTheDocument();
  });
});
