import React from "react";
import { render, screen } from "../../shared/test/testUtils";
import AddAggregatorIntegration from "./AddAggregatorIntegration";
import { INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT } from "./constants";
import {
  testInstitution,
  testInstitutionPermissions,
} from "../testData/institutions";

describe("<AddAggregatorIntegration />", () => {
  it("doesn't render the add button if they don't have permission", () => {
    render(
      <AddAggregatorIntegration
        institution={testInstitution}
        permissions={{
          ...testInstitutionPermissions,
          aggregatorsThatCanBeAdded: [],
        }}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
      }),
    ).not.toBeInTheDocument();
  });
});
