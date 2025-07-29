import React from "react";
import { render, screen, waitForLoad } from "../shared/test/testUtils";
import { createStore } from "../store";
import Connections from "./Connections";
import { addConnection } from "../shared/reducers/demo";

describe("Connections", () => {
  it("displays the connections table", async () => {
    const store = createStore();
    store.dispatch(
      addConnection({
        aggregator: "mx",
        jobTypes: ["Account Number"],
        institution: "Test Bank",
      }),
    );
    render(<Connections />, { store });
    await waitForLoad();

    expect(screen.getByText("Institution")).toBeInTheDocument();
    expect(screen.getByText("Job Types")).toBeInTheDocument();
    expect(screen.getByText("Aggregator")).toBeInTheDocument();
    expect(screen.getByText("Test Bank")).toBeInTheDocument();
    expect(screen.getByText("Account Number")).toBeInTheDocument();
    expect(screen.getByText("MX")).toBeInTheDocument();
  });
});
