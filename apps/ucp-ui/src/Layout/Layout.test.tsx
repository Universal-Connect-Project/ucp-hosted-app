import React from "react";
import { render, screen } from "../shared/test/testUtils";
import Layout from "./Layout";
import {
  SIDE_NAV_LOG_IN_BUTTON_TEXT,
  SIDE_NAV_LOG_OUT_BUTTON_TEXT,
} from "./constants";

describe("<Layout />", () => {
  it("renders the logged out experience", async () => {
    render(<Layout shouldShowLoggedOutExperience />);

    expect(
      await screen.findByRole("link", { name: SIDE_NAV_LOG_IN_BUTTON_TEXT }),
    ).toBeInTheDocument();
  });

  it("renders the logged in experience", async () => {
    render(<Layout />);

    expect(
      await screen.findByRole("button", { name: SIDE_NAV_LOG_OUT_BUTTON_TEXT }),
    ).toBeInTheDocument();
  });
});
