import React from "react";
import {
  render,
  screen,
  userEvent,
  waitForLoad,
} from "../../shared/test/testUtils";
import EditInstitution from "./EditInstitution";
import {
  INSTITUTION_CHANGE_ERROR_TEXT,
  INSTITUTION_FORM_SUBMIT_BUTTON_TEXT,
  INSTITUTION_EDIT_DETAILS_BUTTON_TEXT,
  INSTITUTION_EDIT_SUCCESS_TEXT,
} from "./constants";
import { createInstitutionResponse } from "../../shared/test/testData/institution";
import { server } from "../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_EDIT_INSTITUTION_URL } from "./api";
import { TRY_AGAIN_BUTTON_TEXT } from "../../shared/components/constants";
import { testInstitution } from "../testData/institutions";

describe("<EditInstitution />", () => {
  it("doesn't show the edit button if you don't have access", async () => {
    render(
      <EditInstitution
        institution={{ ...testInstitution, canEditInstitution: false }}
      />,
    );

    await waitForLoad();

    expect(
      screen.queryByRole("button", {
        name: INSTITUTION_EDIT_DETAILS_BUTTON_TEXT,
      }),
    ).not.toBeInTheDocument();
  });

  it("shows an error on api failure, allows retry, and shows a success snackbar", async () => {
    server.use(
      http.put(
        INSTITUTION_SERVICE_EDIT_INSTITUTION_URL,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(<EditInstitution institution={testInstitution} />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: INSTITUTION_EDIT_DETAILS_BUTTON_TEXT,
      }),
    );

    await userEvent.click(
      screen.getByRole("button", { name: INSTITUTION_FORM_SUBMIT_BUTTON_TEXT }),
    );

    expect(
      await screen.findByText(INSTITUTION_CHANGE_ERROR_TEXT),
    ).toBeInTheDocument();

    server.use(
      http.put(INSTITUTION_SERVICE_EDIT_INSTITUTION_URL, () =>
        HttpResponse.json(createInstitutionResponse),
      ),
    );

    await userEvent.click(
      screen.getByRole("button", { name: TRY_AGAIN_BUTTON_TEXT }),
    );

    expect(
      await screen.findByText(INSTITUTION_EDIT_SUCCESS_TEXT),
    ).toBeInTheDocument();
  });
});
