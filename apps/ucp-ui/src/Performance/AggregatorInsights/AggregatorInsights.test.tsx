import React from "react";
import { render, screen, userEvent } from "../../shared/test/testUtils";
import AggregatorInsights, {
  BY_INSTITUTION_TAB_TEXT,
} from "./AggregatorInsights";
import { BY_JOB_TYPE_TABLE_TITLE } from "./ByJobType/constants";
import { BY_INSTITUTION_SEARCH_LABEL_TEXT } from "./ByInstitution/constants";
import { BY_JOB_TYPE_TAB_TEXT } from "./constants";

describe("<AggregatorInsights/>", () => {
  it("shows the by institution tab by default and switches back and forth", async () => {
    render(<AggregatorInsights />);

    expect(
      screen.getByLabelText(BY_INSTITUTION_SEARCH_LABEL_TEXT),
    ).toBeInTheDocument();
    expect(screen.queryByText(BY_JOB_TYPE_TABLE_TITLE)).not.toBeInTheDocument();

    await userEvent.click(screen.getByText(BY_JOB_TYPE_TAB_TEXT));

    expect(screen.getByText(BY_JOB_TYPE_TABLE_TITLE)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(BY_INSTITUTION_SEARCH_LABEL_TEXT),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByText(BY_INSTITUTION_TAB_TEXT));

    expect(
      screen.getByLabelText(BY_INSTITUTION_SEARCH_LABEL_TEXT),
    ).toBeInTheDocument();
    expect(screen.queryByText(BY_JOB_TYPE_TABLE_TITLE)).not.toBeInTheDocument();
  });
});
