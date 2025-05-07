import React from "react";
import { render, screen } from "../shared/test/testUtils";
import Performance from "./Performance";
import { PERFORMANCE_PAGE_TITLE } from "./constants";

describe("<Performance />", () => {
  it("renders the page title", () => {
    render(<Performance />);

    expect(screen.getByText(PERFORMANCE_PAGE_TITLE)).toBeInTheDocument();
  });
});
