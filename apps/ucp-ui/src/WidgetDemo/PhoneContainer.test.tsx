import React from "react";
import { expectSkeletonLoader, render, screen } from "../shared/test/testUtils";
import PhoneContainer from "./PhoneContainer";

describe("PhoneContainer", () => {
  const mockProps = {
    isLoading: false,
  };

  it("renders the skeletonLoader when isLoading is true", async () => {
    render(
      <PhoneContainer {...mockProps} isLoading={true}>
        <iframe title="Test Iframe" src="https://example.com" />
      </PhoneContainer>,
    );
    await expectSkeletonLoader();
  });

  it("renders the iframe with children", () => {
    render(
      <PhoneContainer {...mockProps}>
        <iframe title="Test Iframe" src="https://example.com" />{" "}
      </PhoneContainer>,
    );
    const iframe = screen.getByTitle("Test Iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://example.com");
  });
});
