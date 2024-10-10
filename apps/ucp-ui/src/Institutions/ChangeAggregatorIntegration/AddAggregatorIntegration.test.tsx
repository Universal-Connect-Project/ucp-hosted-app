import React from "react";
import { render, screen } from "../../shared/test/testUtils";
import AddAggregatorIntegration from "./AddAggregatorIntegration";
import { INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT } from "./constants";

describe("<AddAggregatorIntegration />", () => {
  it("doesn't render the add button if they don't have permission", () => {
    render(<AddAggregatorIntegration />);

    expect(
      screen.queryByRole("button", {
        name: INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
      }),
    ).not.toBeInTheDocument();
  });
});
