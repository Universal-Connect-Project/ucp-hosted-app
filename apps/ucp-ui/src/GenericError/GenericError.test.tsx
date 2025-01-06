import React from "react";

import { render, screen, userEvent } from "../shared/test/testUtils";
import {
  GENERIC_ERROR_BUTTON_TEXT,
  GENERIC_ERROR_TITLE_TEXT,
} from "./constants";
import GenericError from "./GenericError";

describe("<GenericError />", () => {
  it("renders Generic Error page, and button redirects to home", async () => {
    render(<GenericError />);

    expect(
      await screen.findByText(GENERIC_ERROR_TITLE_TEXT),
    ).toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole("button", {
        name: GENERIC_ERROR_BUTTON_TEXT,
      }),
    );

    expect(window.location.href).toBe("http://localhost/");
  });
});
