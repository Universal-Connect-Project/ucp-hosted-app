import React from "react";
import { render, screen } from "../../test/testUtils";
import DrawerStickyFooter from "./DrawerStickyFooter";

describe("<DrawerStickyFooter />", () => {
  it("renders the children", () => {
    render(<DrawerStickyFooter>test</DrawerStickyFooter>);

    expect(screen.getByText("test")).toBeInTheDocument();
  });
});
