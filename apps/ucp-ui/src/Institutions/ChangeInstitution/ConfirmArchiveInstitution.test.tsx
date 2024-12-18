import React from "react";
import { render, screen, userEvent } from "../../shared/test/testUtils";
import Institution from "../Institution/Institution";
import {
  INSTITUTION_ARCHIVE_INSTITUTION_BUTTON_TEXT,
  INSTITUTION_ARCHIVE_INSTITUTION_SUBMIT_BUTTON_TEXT,
  INSTITUTION_EDIT_DETAILS_BUTTON_TEXT,
} from "./constants";
import { testInstitution } from "../testData/institutions";

describe("<ConfirmArchiveInstitution />", () => {
  it("shows a snackbar on success and navigates to the institutions path", async () => {
    render(<Institution />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: INSTITUTION_EDIT_DETAILS_BUTTON_TEXT,
      }),
    );

    await userEvent.click(
      await screen.findByRole("button", {
        name: INSTITUTION_ARCHIVE_INSTITUTION_BUTTON_TEXT,
      }),
    );

    await userEvent.click(
      await screen.findByRole("button", {
        name: INSTITUTION_ARCHIVE_INSTITUTION_SUBMIT_BUTTON_TEXT,
      }),
    );

    expect(
      await screen.findByText(`${testInstitution?.name} has been archived`),
    ).toBeInTheDocument();
  });
});
