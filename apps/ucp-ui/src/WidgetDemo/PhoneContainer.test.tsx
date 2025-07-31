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

  it("renders the provided children", () => {
    render(
      <PhoneContainer {...mockProps}>
        <div>Test Child</div>
      </PhoneContainer>,
    );
    const child = screen.getByText("Test Child");
    expect(child).toBeInTheDocument();
  });
});
