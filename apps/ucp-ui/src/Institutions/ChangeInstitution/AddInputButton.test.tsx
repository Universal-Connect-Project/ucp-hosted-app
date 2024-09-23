import React from "react";
import { render, screen, userEvent } from "../../shared/test/testUtils";
import AddInputButton from "./AddInputButton";

describe("<AddInputButton />", () => {
  it("calls the click handler and renders the children", async () => {
    const onClick = jest.fn();
    const buttonText = "buttonText";
    render(<AddInputButton onClick={onClick}>{buttonText}</AddInputButton>);

    await userEvent.click(screen.getByText(buttonText));

    expect(onClick).toHaveBeenCalled();
  });
});
