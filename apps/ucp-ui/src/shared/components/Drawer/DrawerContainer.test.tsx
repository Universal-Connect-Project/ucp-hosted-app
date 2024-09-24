import React from "react";
import { render, screen } from "../../test/testUtils";
import DrawerContainer from "./DrawerContainer";

describe("<DrawerContainer />", () => {
  it("renders the children, footer, and closeButton", () => {
    const children = "test";
    const closeButton = "closeButton";
    const footer = "footer";

    render(
      <DrawerContainer
        closeButton={<div>{closeButton}</div>}
        footer={<div>{footer}</div>}
      >
        {children}
      </DrawerContainer>,
    );

    expect(screen.getByText(children)).toBeInTheDocument();
  });
});
