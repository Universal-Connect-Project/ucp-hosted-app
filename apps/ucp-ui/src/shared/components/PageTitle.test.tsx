import React from "react";
import { render, screen } from "../test/testUtils";
import PageTitle from "./PageTitle";

describe("<PageTitle />", () => {
  it("renders the children", () => {
    const children = "children";
    render(<PageTitle>{children}</PageTitle>);

    expect(screen.getByText(children)).toBeInTheDocument();
  });
});
