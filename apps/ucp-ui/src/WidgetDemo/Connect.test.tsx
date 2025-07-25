import React from "react";
import {
  render,
  screen,
  userEvent,
  waitFor,
  fireEvent,
} from "../shared/test/testUtils";
import Connect from "./Connect";
import {
  LAUNCH_BUTTON_TEXT,
  WIDGET_DEMO_IFRAME_TITLE,
  INSTITUTION_SELECTED,
  MEMBER_CONNECTED,
} from "./constants";
import { createStore } from "../store";
import { addConnection } from "../shared/reducers/demo";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";

describe("Connect", () => {
  it("renders the Connect component and shows the configuration", () => {
    render(<Connect />);

    expect(screen.getByText("Configuration")).toBeInTheDocument();
  });

  it("Selects an aggregator and loads the connect widget", async () => {
    render(<Connect />);

    await userEvent.click(await screen.findByRole("combobox"));
    await userEvent.click(
      await screen.findByRole("option", { name: "Sophtron" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    );
    await waitFor(() => {
      const iframe = screen.getByTitle(WIDGET_DEMO_IFRAME_TITLE);
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        "src",
        expect.stringContaining("sophtron"),
      );
    });
  });

  it("dispatches addConnection on successful member connection", async () => {
    const store = createStore();
    const dispatchSpy = jest.spyOn(store, "dispatch");

    render(<Connect />, { store });
    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.accountOwner.displayName),
    );
    await userEvent.click(await screen.findByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: "MX" }));
    await userEvent.click(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
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

    render(<Connect />, { store });

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
