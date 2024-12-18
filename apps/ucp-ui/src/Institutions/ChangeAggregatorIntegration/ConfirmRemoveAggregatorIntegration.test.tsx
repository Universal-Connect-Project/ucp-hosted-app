import React from "react";
import { render, screen, userEvent } from "../../shared/test/testUtils";
import Institution from "../Institution/Institution";
import { INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_BUTTON_TEST_ID } from "../Institution/constants";
import {
  INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
  INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
} from "./constants";
import { aggregatorIntegrationThatCanBeEdited } from "../testData/institutions";

describe("<ConfirmRemoveAggregatorIntegration />", () => {
  it("shows a snackbar on success", async () => {
    render(<Institution />);

    await userEvent.click(
      await screen.findByTestId(
        INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_BUTTON_TEST_ID,
      ),
    );

    await userEvent.click(
      await screen.findByRole("button", {
        name: INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
      }),
    );

    await userEvent.click(
      await screen.findByRole("button", {
        name: INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
      }),
    );

    expect(
      await screen.findByText(
        `${aggregatorIntegrationThatCanBeEdited.aggregator.displayName} has been removed`,
      ),
    ).toBeInTheDocument();
  });
});
