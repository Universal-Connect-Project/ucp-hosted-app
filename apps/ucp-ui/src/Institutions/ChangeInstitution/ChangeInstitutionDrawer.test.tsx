import React from "react";
import AddInstitution from "./AddInstitution";
import {
  render,
  screen,
  userEvent,
  waitFor,
} from "../../shared/test/testUtils";
import {
  INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
  INSTITUTION_FORM_ADD_KEYWORD_BUTTON_TEXT,
  INSTITUTION_FORM_ADD_ROUTING_NUMBER_BUTTON_TEXT,
  INSTITUTION_FORM_KEYWORD_LABEL_TEXT,
  INSTITUTION_FORM_LOGO_URL_LABEL_TEXT,
  INSTITUTION_FORM_NAME_LABEL_TEXT,
  INSTITUTION_FORM_ROUTING_NUMBER_LABEL_TEXT,
  INSTITUTION_FORM_SUBMIT_BUTTON_TEXT,
  INSTITUTION_FORM_URL_LABEL_TEXT,
  INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
  REMOVE_INPUT_TEST_ID,
} from "./constants";
import { REQUIRED_ERROR_TEXT } from "../../shared/constants/validation";
import { INVALID_URL_TEXT } from "../../shared/utils/validation";

describe("<ChangeInstitution />", () => {
  it("resets the form when the drawer is closed and reopened", async () => {
    render(<AddInstitution />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
      }),
    );

    await userEvent.type(
      await screen.findByLabelText(
        new RegExp(INSTITUTION_FORM_NAME_LABEL_TEXT),
      ),
      "Test Name",
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
      }),
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
      }),
    );

    expect(
      await screen.findByLabelText(
        new RegExp(INSTITUTION_FORM_NAME_LABEL_TEXT),
      ),
    ).toHaveValue("");
  });

  it("removes keywords and routing numbers when the delete button is pressed", async () => {
    render(<AddInstitution />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
      }),
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: INSTITUTION_FORM_ADD_ROUTING_NUMBER_BUTTON_TEXT,
      }),
    );

    expect(
      await screen.findByLabelText(INSTITUTION_FORM_ROUTING_NUMBER_LABEL_TEXT),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByTestId(REMOVE_INPUT_TEST_ID));

    await waitFor(() =>
      expect(
        screen.queryByLabelText(INSTITUTION_FORM_ROUTING_NUMBER_LABEL_TEXT),
      ).not.toBeInTheDocument(),
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: INSTITUTION_FORM_ADD_KEYWORD_BUTTON_TEXT,
      }),
    );

    expect(
      await screen.findByLabelText(INSTITUTION_FORM_KEYWORD_LABEL_TEXT),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByTestId(REMOVE_INPUT_TEST_ID));

    await waitFor(() =>
      expect(
        screen.queryByLabelText(INSTITUTION_FORM_KEYWORD_LABEL_TEXT),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows required validation errors", async () => {
    render(<AddInstitution />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
      }),
    );

    await userEvent.click(
      screen.getByRole("button", { name: INSTITUTION_FORM_SUBMIT_BUTTON_TEXT }),
    );

    expect(await screen.findAllByText(REQUIRED_ERROR_TEXT)).toHaveLength(3);
  });

  it("shows url validation errors", async () => {
    render(<AddInstitution />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
      }),
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

    expect(await screen.findAllByText(INVALID_URL_TEXT)).toHaveLength(2);
  });

  it("shows routing number validation errors", async () => {
    render(<AddInstitution />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
      }),
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
