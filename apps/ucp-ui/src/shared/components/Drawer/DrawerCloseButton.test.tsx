import React from "react";
import { render, screen, userEvent } from "../../test/testUtils";
import DrawerCloseButton from "./DrawerCloseButton";

describe("<DrawerCloseButton />", () => {
  it("calls the close handler on click", async () => {
    const buttonText = "buttonText";
    const handleClose = jest.fn();

    render(
      <DrawerCloseButton handleClose={handleClose}>
        {buttonText}
      </DrawerCloseButton>,
    );

    await userEvent.click(screen.getByRole("button", { name: buttonText }));

    expect(handleClose).toHaveBeenCalled();
  });
});
