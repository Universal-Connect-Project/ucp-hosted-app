import React from "react";
import { render, screen } from "../../shared/test/testUtils";
import { RequiredCheckboxGroupHeader } from "./RequiredCheckboxGroupHeader";

describe("RequiredCheckboxGroupHeader", () => {
  const props = {
    title: "Test Title",
    errorMessage: "Test Error Message",
  };

  it("renders without error", () => {
    render(<RequiredCheckboxGroupHeader {...props} error={false} />);

    const title = screen.getByText(`${props.title}*`);
    expect(title).toBeInTheDocument();
    expect(title).not.toHaveStyle("color: error");

    const errorMessage = screen.getByText(`*${props.errorMessage}`);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).not.toHaveStyle("color: error");
  });

  it("renders with error", () => {
    render(<RequiredCheckboxGroupHeader {...props} error={true} />);

    const title = screen.getByText(`${props.title}*`);
    expect(title).toBeInTheDocument();
    expect(title).toHaveStyle("color: rgb(211, 47, 47)");

    const errorMessage = screen.getByText(`*${props.errorMessage}`);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveStyle("color: rgb(211, 47, 47)");
  });
});
