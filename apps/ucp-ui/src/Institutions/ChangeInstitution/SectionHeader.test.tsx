import React from "react";
import SectionHeader from "./SectionHeader";
import { render, screen, userEvent } from "../../shared/test/testUtils";
import { SECTION_HEADER_INFO_ICON_TEST_ID } from "./constants";

describe("<SectionHeader />", () => {
  it("renders the sectionTitle and a tooltip on hover", async () => {
    const sectionTitle = "sectionTitle";
    const tooltipTitle = "tooltipTitle";

    render(
      <SectionHeader sectionTitle={sectionTitle} tooltipTitle={tooltipTitle} />,
    );

    expect(screen.getByText(sectionTitle)).toBeInTheDocument();

    await userEvent.hover(screen.getByTestId(SECTION_HEADER_INFO_ICON_TEST_ID));

    expect(await screen.findByText(tooltipTitle)).toBeInTheDocument();
  });
});
