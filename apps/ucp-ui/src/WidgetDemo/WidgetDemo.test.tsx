import React from "react";
import { render, screen, userEvent, fireEvent } from "../shared/test/testUtils";
import { createStore } from "../store";
import WidgetDemo from "./WidgetDemo";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";
import {
  CONNECT_TAB,
  CONNECTIONS_TAB,
  INSTITUTION_SELECTED,
  MEMBER_CONNECTED,
} from "./constants";
import { setConnectionDetails } from "../shared/reducers/demo";

describe("DemoTabs", () => {
  it("renders the component with initial tabs", () => {
    const store = createStore();
    store.dispatch(setConnectionDetails({ aggregator: "MX", jobTypes: [] }));
    render(<WidgetDemo />, { store });

    expect(screen.getByText(CONNECT_TAB)).toBeInTheDocument();
    expect(screen.getByText(CONNECTIONS_TAB)).toBeInTheDocument();
  });

  it("switches tabs correctly", async () => {
    const store = createStore();
    store.dispatch(setConnectionDetails({ aggregator: "MX", jobTypes: [] }));
    render(<WidgetDemo />, { store });

    await userEvent.click(screen.getByText(CONNECTIONS_TAB));
    expect(screen.getByText("Institution")).toBeInTheDocument();
  });

  it("handles iframe messages correctly", () => {
    const store = createStore();
    store.dispatch = jest.fn();
    render(<WidgetDemo />, { store });

    const institutionSelectedEvent = {
      origin: WIDGET_DEMO_BASE_URL,
      data: {
        type: INSTITUTION_SELECTED,
        metadata: {
          guid: "test-guid",
          name: "Test Institution",
        },
      },
    };

    fireEvent(window, new MessageEvent("message", institutionSelectedEvent));

    const memberConnectedEvent = {
      origin: WIDGET_DEMO_BASE_URL,
      data: {
        type: MEMBER_CONNECTED,
        metadata: {
          ucpInstitutionId: "test-guid",
        },
      },
    };

    fireEvent(window, new MessageEvent("message", memberConnectedEvent));

    expect(store.dispatch).toHaveBeenCalledWith({
      type: "demo/addConnection",
      payload: "Test Institution",
    });
  });

  it("ignores messages from other origins", () => {
    const store = createStore();
    store.dispatch = jest.fn();
    render(<WidgetDemo />, { store });

    const event = {
      origin: "http://other-origin.com",
      data: {
        type: INSTITUTION_SELECTED,
        metadata: {
          guid: "test-guid",
          name: "Test Institution",
        },
      },
    };

    fireEvent(window, new MessageEvent("message", event));

    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
