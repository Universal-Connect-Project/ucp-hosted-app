import React from "react";
import {
  expectLocation,
  render,
  screen,
  userEvent,
} from "../../shared/test/testUtils";
import AddInstitution from "./AddInstitution";
import {
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
import { REQUIRED_ERROR_TEXT } from "../../shared/constants/validation";

describe("<AddInstitution />", () => {
  it("shows a snackbar and redirects on success", async () => {
    render(<AddInstitution />);

    await userEvent.click(
      screen.getByText(INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT),
    );

    await userEvent.type(
      await screen.findByLabelText(
        new RegExp(INSTITUTION_FORM_NAME_LABEL_TEXT),
      ),
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

    expect(
      await screen.findByText(INSTITUTION_ADD_SUCCESS_TEXT),
    ).toBeInTheDocument();

    expectLocation(`/institutions/${createInstitutionResponse.id}`);
  });

  it("shows an error on api failure and allows retry", () => {});

  it("removes keywords and routing numbers when the delete button is pressed", () => {});

  it("shows required validation errors", async () => {
    render(<AddInstitution />);

    await userEvent.click(
      screen.getByText(INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT),
    );

    await userEvent.click(
      screen.getByRole("button", { name: INSTITUTION_FORM_SUBMIT_BUTTON_TEXT }),
    );

    expect(await screen.findAllByText(REQUIRED_ERROR_TEXT)).toHaveLength(3);
  });

  it("shows url validation errors", async () => {
    render(<AddInstitution />);

    await userEvent.click(
      screen.getByText(INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT),
    );

    await userEvent.type(
      screen.getByLabelText(new RegExp(INSTITUTION_FORM_URL_LABEL_TEXT)),
      "junk",
    );

    await userEvent.type(
      screen.getByLabelText(new RegExp(INSTITUTION_FORM_LOGO_URL_LABEL_TEXT)),
      "junk",
    );

    await userEvent.click(
      screen.getByRole("button", { name: INSTITUTION_FORM_SUBMIT_BUTTON_TEXT }),
    );

    expect(await screen.findAllByText("Not a valid URL")).toHaveLength(2);
  });

  it("shows routing number validation errors", async () => {
    render(<AddInstitution />);

    await userEvent.click(
      screen.getByText(INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT),
    );

    await userEvent.click(
      await screen.findByRole("button", {
        name: INSTITUTION_FORM_ADD_ROUTING_NUMBER_BUTTON_TEXT,
      }),
    );

    await userEvent.type(
      await screen.findByLabelText(INSTITUTION_FORM_ROUTING_NUMBER_LABEL_TEXT),
      "123",
    );

    await userEvent.click(
      screen.getByRole("button", { name: INSTITUTION_FORM_SUBMIT_BUTTON_TEXT }),
    );

    expect(
      await screen.findByText("Must be a 9 digit number"),
    ).toBeInTheDocument();
  });
});
