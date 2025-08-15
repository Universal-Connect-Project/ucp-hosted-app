import React from "react";
import { render, screen } from "../../test/testUtils";
import { TableWrapper } from "./TableWrapper";

describe("<TableWrapper />", () => {
  it("renders children inside the wrapper and applies the height", () => {
    const testContent = "Test Wrapper Content";
    render(<TableWrapper height={100}>{testContent}</TableWrapper>);
    expect(screen.getByText(testContent)).toBeInTheDocument();
    expect(screen.getByText(testContent)).toHaveStyle(`height: 100px`);
  });
});
