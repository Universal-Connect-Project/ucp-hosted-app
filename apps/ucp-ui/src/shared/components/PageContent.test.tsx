import React from "react";
import { render, screen } from "../test/testUtils";
import PageContent from "./PageContent";

describe("<PageContent />", () => {
  it("renders the children", () => {
    render(<PageContent>test</PageContent>);

    expect(screen.getByText("test")).toBeInTheDocument();
  });
});
