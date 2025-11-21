import React from "react";
import {
  render,
  screen,
  userEvent,
  waitForLoad,
} from "../shared/test/testUtils";
import Connect from "./Connect";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";
import {
  CONFIGURATION_HEADER,
  JOB_TYPE_ERROR_MESSAGE,
  LAUNCH_BUTTON_TEXT,
  WIDGET_DEMO_IFRAME_TITLE,
} from "./constants";
import { server } from "../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";

describe("WidgetConfiguration", () => {
  it("renders the initial configuration form", async () => {
    render(<Connect />);
    await waitForLoad();
    expect(screen.getByText(CONFIGURATION_HEADER)).toBeInTheDocument();
    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.accountNumber.displayName),
    );
    expect(
      screen.getByLabelText(supportsJobTypeMap.accountNumber.displayName),
    ).toBeChecked();
    expect(
      screen.getByLabelText(supportsJobTypeMap.accountOwner.displayName),
    ).not.toBeChecked();
    await userEvent.click(await screen.findByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: "MX" }));
    expect(screen.getByText("MX")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    ).toBeInTheDocument();
  });

  it("shows an error if Launch is clicked with no job types selected", async () => {
    render(<Connect />);
    await userEvent.click(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    );
    expect(screen.getByText(`*${JOB_TYPE_ERROR_MESSAGE}`)).toHaveStyle({
      color: "rgb(211, 47, 47)",
    });
    expect(screen.getByText(`*${JOB_TYPE_ERROR_MESSAGE}`)).toBeInTheDocument();
  });

  it("shows an error if Launch is clicked with no aggregator selected", async () => {
    render(<Connect />);
    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.accountNumber.displayName),
    );
    await userEvent.click(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    );
    expect(screen.getByText(`Required`)).toBeInTheDocument();
  });

  it("calls onSubmit with the correct data when form is valid", async () => {
    let requestBody: Record<string, unknown> | undefined;
    const responseData = {
      widgetUrl: "http://localhost:8080/widget?token=abc123-def456-789",
    };

    server.use(
      http.post(`${WIDGET_DEMO_BASE_URL}/widgetUrl`, async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(responseData);
      }),
    );

    render(<Connect />);
    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.accountNumber.displayName),
    );
    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.transactions.displayName),
    );
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "Sophtron" }));
    await userEvent.click(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    );
    const iframe = await screen.findByTitle(WIDGET_DEMO_IFRAME_TITLE);
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute("src")).toBe(responseData.widgetUrl);

    expect(requestBody).toBeDefined();
    expect(requestBody).toMatchObject({
      jobTypes: ["accountNumber", "transactions"],
      aggregatorOverride: "sophtron",
      targetOrigin: window.location.origin,
    });
    expect(requestBody?.userId).toBeDefined();
  });
});
