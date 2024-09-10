import React from "react";
import { render, screen, within } from "../shared/test/testUtils";
import Institutions from "./Institutions";
import {
  INSTITUTIONS_ROW_TEST_ID,
  INSTITUTITIONS_ROW_AGGREGATOR_CHIP_TEST_ID,
} from "./constants";
import { testInstitution } from "./testData/institutions";

describe("<Institutions />", () => {
  it("sorts the aggregators by their displayName and shows the number of supported job types", () => {
    expect(testInstitution.aggregators[0].displayName).toEqual("Sophtron");
    expect(testInstitution.aggregators[1].displayName).toEqual("MX");

    render(<Institutions />);

    const rowWithTestInstitution = screen.getByTestId(
      `${INSTITUTIONS_ROW_TEST_ID}-${testInstitution.ucp_id}`,
    );

    const [mxChip, sophtronChip] = within(
      rowWithTestInstitution,
    ).getAllByTestId(new RegExp(INSTITUTITIONS_ROW_AGGREGATOR_CHIP_TEST_ID));

    expect(within(mxChip).getByText(4)).toBeInTheDocument();
    expect(within(mxChip).getByText("MX")).toBeInTheDocument();

    expect(within(sophtronChip).getByText(3)).toBeInTheDocument();
    expect(within(sophtronChip).getByText("Sophtron")).toBeInTheDocument();
  });
});
