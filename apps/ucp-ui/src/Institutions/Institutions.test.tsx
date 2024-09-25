import React from "react";
import { render, screen, userEvent, within } from "../shared/test/testUtils";
import Institutions from "./Institutions";
import {
  INSTITUTIONS_PERMISSIONS_ERROR_TEXT,
  INSTITUTIONS_ROW_TEST_ID,
  INSTITUTITIONS_ROW_AGGREGATOR_CHIP_TEST_ID,
} from "./constants";
import { testInstitution } from "./testData/institutions";
import { server } from "../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_PERMISSIONS_URL } from "./api";
import { institutionPermissionsResponse } from "../shared/test/testData/institution";
import { TRY_AGAIN_BUTTON_TEXT } from "../shared/components/constants";
import { INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT } from "./ChangeInstitution/constants";

describe("<Institutions />", () => {
  it("shows an error on permissions load failure and allows retry", async () => {
    server.use(
      http.get(
        INSTITUTION_SERVICE_PERMISSIONS_URL,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(<Institutions />);

    expect(
      await screen.findByText(INSTITUTIONS_PERMISSIONS_ERROR_TEXT),
    ).toBeInTheDocument();

    server.use(
      http.get(INSTITUTION_SERVICE_PERMISSIONS_URL, () =>
        HttpResponse.json(institutionPermissionsResponse),
      ),
    );

    await userEvent.click(await screen.findByText(TRY_AGAIN_BUTTON_TEXT));

    expect(
      await screen.findByRole("button", {
        name: INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
      }),
    ).toBeInTheDocument();
  });

  it("sorts the aggregators by their displayName and shows the number of supported job types", async () => {
    expect(
      testInstitution.aggregatorIntegrations[0].aggregator.displayName,
    ).toEqual("Sophtron");
    expect(
      testInstitution.aggregatorIntegrations[1].aggregator.displayName,
    ).toEqual("MX");

    render(<Institutions />);

    const rowWithTestInstitution = await screen.findByTestId(
      `${INSTITUTIONS_ROW_TEST_ID}-${testInstitution.id}`,
    );

    const [mxChip, sophtronChip] = within(
      rowWithTestInstitution,
    ).getAllByTestId(new RegExp(INSTITUTITIONS_ROW_AGGREGATOR_CHIP_TEST_ID));

    expect(within(mxChip).getByText(4)).toBeInTheDocument();
    expect(within(mxChip).getByText("MX")).toBeInTheDocument();

    expect(within(sophtronChip).getByText(3)).toBeInTheDocument();
    expect(within(sophtronChip).getByText("Sophtron")).toBeInTheDocument();
  });

  it("renders the name of the institution and the ucp id", async () => {
    render(<Institutions />);

    expect(await screen.findByText(testInstitution.id)).toBeInTheDocument();
    expect(await screen.findByText(testInstitution.name)).toBeInTheDocument();
  });
});
