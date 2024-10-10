import React from "react";
import { render, screen } from "../../shared/test/testUtils";
import InstitutionSection from "./InstitutionSection";

describe("<InstitutionSection />", () => {
  it("renders the children and title", () => {
    const childrenText = "testChildren";
    const children = <div>{childrenText}</div>;
    const title = "testTitle";

    render(<InstitutionSection title={title}>{children}</InstitutionSection>);

    expect(screen.getByText(childrenText)).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
