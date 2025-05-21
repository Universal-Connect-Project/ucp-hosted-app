import React from "react";
import {
  expectSkeletonLoader,
  render,
  screen,
  userEvent,
} from "../../../shared/test/testUtils";
import ByJobType from "./ByJobType";
import {
  AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_ERROR_TEXT,
  JOB_TYPE_PERFORMANCE_TEST_ID,
} from "./constants";
import { server } from "../../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_URL } from "../api";
import { aggregatorPerformanceByJobType } from "../testData/aggregatorPerformanceByJobType";
import {
  allJobTypeCombinations,
  allJobTypes,
  supportsJobTypeMap,
} from "../../../shared/constants/jobTypes";
import { TRY_AGAIN_BUTTON_TEXT } from "../../../shared/components/constants";
import {
  thirtyDaysOption,
  TIME_FRAME_LABEL_TEXT,
  timeFrameOptions,
} from "../../../shared/components/Forms/constants";

describe("<ByJobType />", () => {
  it("renders an error state and allow retry", async () => {
    server.use(
      http.get(
        AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_URL,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(<ByJobType />);

    expect(
      await screen.findByText(AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_ERROR_TEXT),
    ).toBeInTheDocument();

    server.use(
      http.get(AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_URL, () =>
        HttpResponse.json(aggregatorPerformanceByJobType),
      ),
    );

    await userEvent.click(
      screen.getByRole("button", { name: TRY_AGAIN_BUTTON_TEXT }),
    );

    expect(
      await screen.findByText(
        aggregatorPerformanceByJobType.aggregators[0].displayName,
      ),
    ).toBeInTheDocument();
  });

  it("uses 30 days as the default time frame", async () => {
    render(<ByJobType />);

    expect(await screen.findByText(thirtyDaysOption.label)).toBeInTheDocument();
  });

  it("renders a loading state on initial load and after the time frame changes and filters by the time frame", async () => {
    server.use(
      http.get(AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_URL, ({ request }) => {
        const searchParams = new URL(request.url).searchParams;
        const timeFrame = searchParams.get("timeFrame");

        if (timeFrame === timeFrameOptions[0].value) {
          return HttpResponse.json({
            aggregators: [aggregatorPerformanceByJobType.aggregators[1]],
          });
        }

        return HttpResponse.json({
          aggregators: [aggregatorPerformanceByJobType.aggregators[0]],
        });
      }),
    );

    const aggregatorInDefaultResponse =
      aggregatorPerformanceByJobType.aggregators[0].displayName;
    const aggregatorInNewResponse =
      aggregatorPerformanceByJobType.aggregators[1].displayName;

    render(<ByJobType />);

    await expectSkeletonLoader();

    expect(
      await screen.findByText(aggregatorInDefaultResponse),
    ).toBeInTheDocument();

    expect(screen.queryByText(aggregatorInNewResponse)).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(TIME_FRAME_LABEL_TEXT));

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    userEvent.click(await screen.findByText(timeFrameOptions[0].label));

    await expectSkeletonLoader();

    expect(
      await screen.findByText(aggregatorInNewResponse),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(aggregatorInDefaultResponse),
    ).not.toBeInTheDocument();
  });

  it("renders all job type combinations and filters them", async () => {
    render(<ByJobType />);

    expect(
      await screen.findAllByTestId(JOB_TYPE_PERFORMANCE_TEST_ID),
    ).toHaveLength(allJobTypeCombinations.length);

    await Promise.all(
      allJobTypes.map(async (jobType) => {
        await userEvent.click(
          screen.getByRole("button", {
            name: supportsJobTypeMap[jobType].displayName,
          }),
        );
      }),
    );

    expect(
      await screen.findAllByTestId(JOB_TYPE_PERFORMANCE_TEST_ID),
    ).toHaveLength(1 + allJobTypes.length);
  });

  it("renders data for a single job type, a combo job type, and overall performance", async () => {
    server.use(
      http.get(AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_URL, () =>
        HttpResponse.json({
          aggregators: [
            {
              ...aggregatorPerformanceByJobType.aggregators[0],
              avgDuration: 95,
              avgSuccessRate: 96,
              jobTypes: {
                accountNumber: {
                  avgDuration: 99,
                  avgSuccessRate: 100,
                },
                ["accountNumber|transactions"]: {
                  avgDuration: 97,
                  avgSuccessRate: 98,
                },
              },
            },
          ],
        }),
      ),
    );

    render(<ByJobType />);

    expect(await screen.findByText("100% | 99s")).toBeInTheDocument();
    expect(await screen.findByText("98% | 97s")).toBeInTheDocument();
    expect(await screen.findByText("95s")).toBeInTheDocument();
    expect(await screen.findByText("96%")).toBeInTheDocument();
  });
});
