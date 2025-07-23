import React from "react";
import { render, screen } from "../shared/test/testUtils";
import { createStore } from "../store";
import Connections from "./Connections";
import { addConnection, setConnectionDetails } from "../shared/reducers/demo";

describe("Connections", () => {
  it("displays the connections table", () => {
    const store = createStore();
    store.dispatch(
      setConnectionDetails({
        aggregator: "MX",
        jobTypes: ["Account Number"],
      }),
    );
    store.dispatch(addConnection("Test Bank"));
    render(<Connections />, { store });

    expect(screen.getByText("Institution")).toBeInTheDocument();
    expect(screen.getByText("Job Types")).toBeInTheDocument();
    expect(screen.getByText("Aggregator")).toBeInTheDocument();
    expect(screen.getByText("Test Bank")).toBeInTheDocument();
    expect(screen.getByText("Account Number")).toBeInTheDocument();
    expect(screen.getByText("MX")).toBeInTheDocument();
  });
});
