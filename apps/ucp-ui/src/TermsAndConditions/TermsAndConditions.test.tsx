import React from "react";
import { render, screen } from "../shared/test/testUtils";
import TermsAndConditions from "./TermsAndConditions";
import { TERMS_AND_CONDITIONS_PAGE_TITLE_TEXT } from "./constants";

describe("<TermsAndConditions", () => {
  it("renders the title", () => {
    render(<TermsAndConditions />);

    expect(
      screen.getByText(TERMS_AND_CONDITIONS_PAGE_TITLE_TEXT),
    ).toBeInTheDocument();
  });
});
