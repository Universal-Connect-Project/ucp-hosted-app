import React from "react";
import { render, screen } from "../../test/testUtils";
import { JobTypesSelectFlexContainer } from "./JobTypesSelectFlexContainer";

describe("<JobTypesSelectFlexContainer />", () => {
  it("renders the children", () => {
    const childText = "Test Child";

    render(
      <JobTypesSelectFlexContainer>{childText}</JobTypesSelectFlexContainer>,
    );

    expect(screen.getByText(childText)).toBeInTheDocument();
  });
});
