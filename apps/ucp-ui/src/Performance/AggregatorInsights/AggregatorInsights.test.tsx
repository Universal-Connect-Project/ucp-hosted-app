import React from "react";
import { render, screen, userEvent } from "../../shared/test/testUtils";
import AggregatorInsights, { BY_JOB_TYPE_TAB_TEXT } from "./AggregatorInsights";
import { BY_JOB_TYPE_TABLE_TITLE } from "./ByJobType/constants";

describe("<AggregatorInsights/>", () => {
  it("shows by job type when its tab is clicked", async () => {
    render(<AggregatorInsights />);

    await userEvent.click(screen.getByText(BY_JOB_TYPE_TAB_TEXT));

    expect(screen.getByText(BY_JOB_TYPE_TABLE_TITLE)).toBeInTheDocument();
  });
});
