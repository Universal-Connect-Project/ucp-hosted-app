import React from "react";
import { render, screen } from "../../test/testUtils";
import DrawerContent from "./DrawerContent";

describe("<DrawerContent />", () => {
  it("renders the children", () => {
    render(<DrawerContent>test</DrawerContent>);

    expect(screen.getByText("test")).toBeInTheDocument();
  });
});
