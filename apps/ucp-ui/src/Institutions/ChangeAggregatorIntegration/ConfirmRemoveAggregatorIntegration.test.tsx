import React from "react";
import { render, screen, userEvent } from "../../shared/test/testUtils";
import Institution from "../Institution/Institution";
import { INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_BUTTON_TEST_ID } from "../Institution/constants";
import {
  INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
  INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_ERROR_TEXT,
  INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
} from "./constants";
import { server } from "../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL } from "./api";
import { aggregatorIntegrationThatCanBeEdited } from "../testData/institutions";
import { TRY_AGAIN_BUTTON_TEXT } from "../../shared/components/constants";
import { INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT } from "../ChangeInstitution/constants";

describe("<ConfirmRemoveAggregatorIntegration />", () => {
  it("shows an error state and allows retry", async () => {
    server.use(
      http.delete(
        `${INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL}/:integrationId`,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

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
        INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_ERROR_TEXT,
      ),
    ).toBeInTheDocument();

    server.use(
      http.delete(
        `${INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL}/:integrationId`,
        () => HttpResponse.json({}),
      ),
    );

    await userEvent.click(
      screen.getByRole("button", { name: TRY_AGAIN_BUTTON_TEXT }),
    );

    expect(
      await screen.findByText(
        `${aggregatorIntegrationThatCanBeEdited.aggregator.displayName} has been removed`,
      ),
    ).toBeInTheDocument();
  });

  it("shows a snackbar and closes the drawer on success", async () => {
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

    expect(
      screen.getAllByRole("button", {
        name: INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
      }).length,
    ).toBeGreaterThan(0);

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

    expect(
      screen.queryByRole("button", {
        name: INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
      }),
    ).not.toBeInTheDocument();
  });

  it("closes the drawer when hitting either cancel button", async () => {
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
      (
        await screen.findAllByRole("button", {
          name: INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
        })
      )[0],
    );

    expect(
      screen.queryByRole("button", {
        name: INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
      }),
    ).not.toBeInTheDocument();

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
      (
        await screen.findAllByRole("button", {
          name: INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
        })
      )[1],
    );

    expect(
      screen.queryByRole("button", {
        name: INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
      }),
    ).not.toBeInTheDocument();
  });
});
