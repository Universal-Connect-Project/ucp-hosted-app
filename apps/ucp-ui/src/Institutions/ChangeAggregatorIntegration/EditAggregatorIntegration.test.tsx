import React from "react";
import {
  render,
  screen,
  userEvent,
  waitFor,
} from "../../shared/test/testUtils";
import Institution from "../Institution/Institution";
import { INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_BUTTON_TEST_ID } from "../Institution/constants";
import {
  INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
  INSTITUTION_CHANGE_AGGREGATOR_ERROR_TEXT,
  INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_SUCCESS_TEXT,
} from "./constants";
import { server } from "../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL } from "./api";
import { TRY_AGAIN_BUTTON_TEXT } from "../../shared/components/constants";

describe("<EditAggregatorIntegration />", () => {
  it("shows an error message on failure, allows retry, and closes the drawer and shows a success message on success", async () => {
    server.use(
      http.put(
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
        name: INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
      }),
    );

    expect(
      await screen.findByText(INSTITUTION_CHANGE_AGGREGATOR_ERROR_TEXT),
    ).toBeInTheDocument();

    server.use(
      http.put(
        `${INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL}/:integrationId`,
        () => HttpResponse.json({}),
      ),
    );

    await userEvent.click(
      await screen.findByRole("button", {
        name: TRY_AGAIN_BUTTON_TEXT,
      }),
    );

    expect(
      await screen.findByText(
        INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_SUCCESS_TEXT,
      ),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.queryByRole("button", {
          name: INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
        }),
      ).not.toBeInTheDocument(),
    );
  });
});
