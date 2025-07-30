import React from "react";
import { render, screen, userEvent } from "../shared/test/testUtils";

import WidgetDemo from "./WidgetDemo";
import { CONNECT_TAB, CONNECTIONS_TAB } from "./constants";

describe("WidgetDemo", () => {
  it("renders the component with initial tabs", () => {
    render(<WidgetDemo />);

    expect(screen.getByText(CONNECT_TAB)).toBeInTheDocument();
    expect(screen.getByText(CONNECTIONS_TAB)).toBeInTheDocument();
    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(screen.getByText("Job type*")).toBeInTheDocument();
  });

  it("switches tabs correctly", async () => {
    render(<WidgetDemo />);

    await userEvent.click(screen.getByText(CONNECTIONS_TAB));
    expect(screen.getByText("Institution")).toBeInTheDocument();
  });
});
