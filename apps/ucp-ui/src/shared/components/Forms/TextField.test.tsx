import React from "react";
import { render, screen } from "../../test/testUtils";
import TextField from "./TextField";

describe("TextField", () => {
  it("renders autoComplete as off by default", () => {
    const label = "label";
    render(<TextField label={label} />);

    expect(screen.getByLabelText(label)).toHaveAttribute("autoComplete", "off");
  });

  it("overrides autoComplete if provided", () => {
    const label = "label";
    render(<TextField autoComplete="on" label={label} />);

    expect(screen.getByLabelText(label)).toHaveAttribute("autoComplete", "on");
  });

  it("renders an error adornment if the field is in error state", () => {
    render(<TextField error />);

    expect(screen.getByTestId("ErrorIcon")).toBeInTheDocument();
  });
});
