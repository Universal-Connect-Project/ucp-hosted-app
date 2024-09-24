import React from "react";
import { render, screen } from "../../test/testUtils";
import DrawerTitle from "./DrawerTitle";

describe("<DrawerTitle />", () => {
  it("renders the children", () => {
    render(<DrawerTitle>test</DrawerTitle>);

    expect(screen.getByText("test")).toBeInTheDocument();
  });
});
