import React from "react";
import { render, screen, userEvent } from "../shared/test/testUtils";
import ConnectWidget from "./ConnectWidget";
import {
  WIDGET_DEMO_ERROR_MESSAGE,
  WIDGET_DEMO_IFRAME_TITLE,
  RESET_BUTTON_TEXT,
  LAUNCH_BUTTON_TEXT,
} from "./constants";
import { server } from "../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";
import { TRY_AGAIN_BUTTON_TEXT } from "../shared/components/constants";
import Connect from "./Connect";

const jobTypes = ["accountNumber", "accountOwner"];
const aggregator = "MX";
const onReset = jest.fn();

describe("Connect", () => {
  it("renders the widget demo iframe", async () => {
    render(
      <ConnectWidget
        jobTypes={jobTypes}
        aggregator={aggregator}
        onReset={onReset}
      />,
    );

    const iframe = await screen.findByTitle(WIDGET_DEMO_IFRAME_TITLE);
    expect(iframe).toBeInTheDocument();
  });

  it("renders an error message when token fetch fails", async () => {
    server.use(
      http.get(`${WIDGET_DEMO_BASE_URL}/api/token`, () =>
        HttpResponse.json({ error: "Failed to fetch token" }, { status: 500 }),
      ),
    );

    render(
      <ConnectWidget
        jobTypes={jobTypes}
        aggregator={aggregator}
        onReset={onReset}
      />,
    );

    expect(
      await screen.findByText(WIDGET_DEMO_ERROR_MESSAGE),
    ).toBeInTheDocument();

    server.use(
      http.get(`${WIDGET_DEMO_BASE_URL}/api/token`, () =>
        HttpResponse.json({ token: "randomtoken" }),
      ),
    );

    await userEvent.click(screen.getByText(TRY_AGAIN_BUTTON_TEXT));
    const iframe = await screen.findByTitle(WIDGET_DEMO_IFRAME_TITLE);
    expect(iframe).toBeInTheDocument();
  });

  it("calls onReset when the reset button is clicked", async () => {
    render(<Connect />);
    await userEvent.click(
      await screen.findByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    );
    await screen.findByTitle(WIDGET_DEMO_IFRAME_TITLE);
    await userEvent.click(
      screen.getByRole("button", { name: RESET_BUTTON_TEXT }),
    );
    expect(await screen.findByText("Configuration")).toBeInTheDocument();
    expect(
      await screen.findByRole("checkbox", { name: "Account Number" }),
    ).toBeChecked();
  });
});
