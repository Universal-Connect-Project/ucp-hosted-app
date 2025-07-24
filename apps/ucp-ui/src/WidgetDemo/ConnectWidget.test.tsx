import React from "react";
import { render, screen, userEvent, fireEvent } from "../shared/test/testUtils";
import ConnectWidget from "./ConnectWidget";
import {
  WIDGET_DEMO_ERROR_MESSAGE,
  WIDGET_DEMO_IFRAME_TITLE,
  INSTITUTION_SELECTED,
  MEMBER_CONNECTED,
  RESET_BUTTON_TEXT,
} from "./constants";
import { server } from "../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";
import { TRY_AGAIN_BUTTON_TEXT } from "../shared/components/constants";
import { createStore } from "../store";
import { addConnection } from "../shared/reducers/demo";

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
    render(
      <ConnectWidget
        jobTypes={jobTypes}
        aggregator={aggregator}
        onReset={onReset}
      />,
    );

    await userEvent.click(screen.getByText(RESET_BUTTON_TEXT));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("dispatches addConnection on successful member connection", () => {
    const store = createStore();
    const dispatchSpy = jest.spyOn(store, "dispatch");

    render(
      <ConnectWidget
        jobTypes={jobTypes}
        aggregator={aggregator}
        onReset={onReset}
      />,
      { store },
    );

    fireEvent(
      window,
      new MessageEvent("message", {
        origin: WIDGET_DEMO_BASE_URL,
        data: {
          type: INSTITUTION_SELECTED,
          metadata: { name: "Test Institution" },
        },
      }),
    );

    fireEvent(
      window,
      new MessageEvent("message", {
        origin: WIDGET_DEMO_BASE_URL,
        data: { type: MEMBER_CONNECTED },
      }),
    );

    expect(dispatchSpy).toHaveBeenCalledWith(
      addConnection({
        aggregator: "MX",
        jobTypes: ["Account Number", "Account Owner"],
        institution: "Test Institution",
      }),
    );
  });

  it("does not dispatch addConnection if origin is incorrect", () => {
    const store = createStore();
    const dispatchSpy = jest.spyOn(store, "dispatch");

    render(
      <ConnectWidget
        jobTypes={jobTypes}
        aggregator={aggregator}
        onReset={onReset}
      />,
      { store },
    );

    fireEvent(
      window,
      new MessageEvent("message", {
        origin: "http://wrong-origin.com",
        data: {
          type: INSTITUTION_SELECTED,
          metadata: { name: "Test Institution" },
        },
      }),
    );

    fireEvent(
      window,
      new MessageEvent("message", {
        origin: "http://wrong-origin.com",
        data: { type: MEMBER_CONNECTED },
      }),
    );

    expect(dispatchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "demo/addConnection" }),
    );
  });
});
