import React from "react";
import { render, screen } from "../test/testUtils";
import { SuccessRateTrendsChart } from "./SuccessRateTrendsChart";
import { oneDayOption } from "./Forms/constants";
import { SUCCESS_RATE_TRENDS_CHART_TITLE } from "./successRateTrendsChartConsts";

describe("<SuccessRateTrendsChart />", () => {
  it("renders with the correct title", () => {
    render(
      <SuccessRateTrendsChart
        data={undefined}
        isError={false}
        isFetching={false}
        refetch={() => {}}
        timeFrame={oneDayOption.value}
      />,
    );

    expect(
      screen.getByText(SUCCESS_RATE_TRENDS_CHART_TITLE),
    ).toBeInTheDocument();
  });
});
