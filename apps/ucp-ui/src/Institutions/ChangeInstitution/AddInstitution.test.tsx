import React from "react";
import {
  expectLocation,
  render,
  screen,
  userEvent,
  waitForLoad,
} from "../../shared/test/testUtils";
import AddInstitution from "./AddInstitution";
import {
  INSTITUTION_CHANGE_ERROR_TEXT,
  INSTITUTION_ADD_SUCCESS_TEXT,
  INSTITUTION_FORM_ADD_KEYWORD_BUTTON_TEXT,
  INSTITUTION_FORM_ADD_ROUTING_NUMBER_BUTTON_TEXT,
  INSTITUTION_FORM_KEYWORD_LABEL_TEXT,
  INSTITUTION_FORM_LOGO_URL_LABEL_TEXT,
  INSTITUTION_FORM_NAME_LABEL_TEXT,
  INSTITUTION_FORM_ROUTING_NUMBER_LABEL_TEXT,
  INSTITUTION_FORM_SUBMIT_BUTTON_TEXT,
  INSTITUTION_FORM_URL_LABEL_TEXT,
  INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
} from "./constants";
import { createInstitutionResponse } from "../../shared/test/testData/institution";
import { server } from "../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_CREATE_INSTITUTION_URL } from "./api";
import { TRY_AGAIN_BUTTON_TEXT } from "../../shared/components/constants";
import { INSTITUTION_SERVICE_PERMISSIONS_URL } from "../api";

const renderAndSubmit = async () => {
  render(<AddInstitution />);

  await userEvent.click(
    await screen.findByRole("button", {
      name: INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
    }),
  );

  await userEvent.type(
    await screen.findByLabelText(new RegExp(INSTITUTION_FORM_NAME_LABEL_TEXT)),
    "Test Name",
  );

  await userEvent.type(
    screen.getByLabelText(new RegExp(INSTITUTION_FORM_URL_LABEL_TEXT)),
    "http://fake",
  );

  await userEvent.type(
    screen.getByLabelText(new RegExp(INSTITUTION_FORM_LOGO_URL_LABEL_TEXT)),
    "http://fake",
  );

  await userEvent.click(
    screen.getByRole("button", {
      name: INSTITUTION_FORM_ADD_ROUTING_NUMBER_BUTTON_TEXT,
    }),
  );

  await userEvent.type(
    await screen.findByLabelText(INSTITUTION_FORM_ROUTING_NUMBER_LABEL_TEXT),
    "123456789",
  );

  await userEvent.click(
    screen.getByRole("button", {
      name: INSTITUTION_FORM_ADD_KEYWORD_BUTTON_TEXT,
    }),
  );

  await userEvent.type(
    await screen.findByLabelText(INSTITUTION_FORM_KEYWORD_LABEL_TEXT),
    "Test",
  );

  await userEvent.click(
    screen.getByRole("button", { name: INSTITUTION_FORM_SUBMIT_BUTTON_TEXT }),
  );
};

describe("<AddInstitution />", () => {
  it("doesn't show the add button if you don't have access", async () => {
    server.use(
      http.get(INSTITUTION_SERVICE_PERMISSIONS_URL, () =>
        HttpResponse.json({}),
      ),
    );

    render(<AddInstitution />);

    await waitForLoad();

    expect(
      screen.queryByRole("button", {
        name: INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
      }),
    ).not.toBeInTheDocument();
  });

  it("shows a snackbar and redirects on success", async () => {
    await renderAndSubmit();

    expect(
      await screen.findByText(INSTITUTION_ADD_SUCCESS_TEXT),
    ).toBeInTheDocument();

    expectLocation(`/institutions/${createInstitutionResponse.id}`);
  });

  it("shows an error on api failure, allows retry, and shows a success snackbar", async () => {
    server.use(
      http.post(
        INSTITUTION_SERVICE_CREATE_INSTITUTION_URL,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    await renderAndSubmit();

    expect(
      await screen.findByText(INSTITUTION_CHANGE_ERROR_TEXT),
    ).toBeInTheDocument();

    server.use(
      http.post(INSTITUTION_SERVICE_CREATE_INSTITUTION_URL, () =>
        HttpResponse.json(createInstitutionResponse),
      ),
    );

    await userEvent.click(
      screen.getByRole("button", { name: TRY_AGAIN_BUTTON_TEXT }),
    );

    expect(
      await screen.findByText(INSTITUTION_ADD_SUCCESS_TEXT),
    ).toBeInTheDocument();
  });
});
