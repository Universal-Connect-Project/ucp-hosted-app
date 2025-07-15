import React from "react";
import { render, screen, userEvent } from "../shared/test/testUtils";
import PhoneContainer from "./PhoneContainer";

describe("PhoneContainer", () => {
  const mockProps = {
    src: "https://example.com",
    title: "Test Iframe",
    onReset: jest.fn(),
  };

  it("renders the iframe with the correct src and title", () => {
    render(<PhoneContainer {...mockProps} />);
    const iframe = screen.getByTitle(mockProps.title);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", mockProps.src);
  });

  it("renders the reset button", () => {
    render(<PhoneContainer {...mockProps} />);
    const resetButton = screen.getByRole("button", { name: /reset/i });
    expect(resetButton).toBeInTheDocument();
  });

  it("calls onReset when the reset button is clicked", async () => {
    render(<PhoneContainer {...mockProps} />);
    const resetButton = screen.getByRole("button", { name: /reset/i });
    await userEvent.click(resetButton);
    expect(mockProps.onReset).toHaveBeenCalledTimes(1);
  });
});
