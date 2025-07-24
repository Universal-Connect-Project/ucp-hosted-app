import React from "react";
import { render, screen } from "../test/testUtils";
import { oneDayOption } from "./Forms/constants";
import { DurationTrendsChart } from "./DurationTrendsChart";
import { DURATION_TRENDS_CHART_TITLE } from "./durationTrendsChartConsts";

describe("<DurationTrendsChart />", () => {
  it("renders with the correct title", () => {
    render(
      <DurationTrendsChart
        data={undefined}
        isError={false}
        isFetching={false}
        refetch={() => {}}
        timeFrame={oneDayOption.value}
      />,
    );

    expect(screen.getByText(DURATION_TRENDS_CHART_TITLE)).toBeInTheDocument();
  });
});
