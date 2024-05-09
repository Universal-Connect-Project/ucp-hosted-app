import React from "react";
import App from "./App";
import { render, screen } from "./shared/test/testUtils";

describe("<App />", () => {
  it("renders hello world", () => {
    render(<App />);

    expect(screen.getByText("Hello world!")).toBeInTheDocument();
  });
});
