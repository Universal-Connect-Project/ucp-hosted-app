import React from "react";
import {
  render,
  screen,
  userEvent,
  waitForLoad,
} from "../shared/test/testUtils";
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
import { supportsJobTypeMap } from "../shared/constants/jobTypes";

const jobTypes = ["accountNumber", "accountOwner"];
const aggregator = "MX";
const onReset = jest.fn();

describe("ConnectWidget", () => {
  it("renders the widget demo iframe", async () => {
    render(
      <ConnectWidget
        jobTypes={jobTypes}
        aggregator={aggregator}
        onReset={onReset}
      />,
    );
    await waitForLoad();
    const iframe = await screen.findByTitle(WIDGET_DEMO_IFRAME_TITLE);
    expect(iframe).toBeInTheDocument();
  });

  it("renders an error message when widget URL fetch fails", async () => {
    server.use(
      http.post(`${WIDGET_DEMO_BASE_URL}/widgetUrl`, () =>
        HttpResponse.json(
          { error: "Failed to create widget URL" },
          { status: 500 },
        ),
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
      http.post(`${WIDGET_DEMO_BASE_URL}/widgetUrl`, () =>
        HttpResponse.json({
          widgetUrl: "http://localhost:8080/widget?token=abc123-def456-789",
        }),
      ),
    );

    await userEvent.click(screen.getByText(TRY_AGAIN_BUTTON_TEXT));
    const iframe = await screen.findByTitle(WIDGET_DEMO_IFRAME_TITLE);
    expect(iframe).toBeInTheDocument();
  });

  it("resets to the empty widget configuration form when the reset button is clicked", async () => {
    render(<Connect />);
    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.accountNumber.displayName),
    );
    await userEvent.click(await screen.findByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: "MX" }));
    await userEvent.click(
      await screen.findByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    );
    await screen.findByTitle(WIDGET_DEMO_IFRAME_TITLE);
    await userEvent.click(
      screen.getByRole("button", { name: RESET_BUTTON_TEXT }),
    );
    expect(await screen.findByText("Configuration")).toBeInTheDocument();
    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.accountNumber.displayName),
    );
    expect(
      await screen.findByRole("checkbox", { name: "Account Number" }),
    ).toBeChecked();
  });
});
