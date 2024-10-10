import React from "react";
import Institution from "./Institution";
import {
  expectLocation,
  expectSkeletonLoader,
  render,
  screen,
  userEvent,
  within,
} from "../../shared/test/testUtils";
import {
  institutionResponse,
  testInstitutionActiveAndInactive,
} from "../testData/institutions";
import {
  INSTITUTION_ACTIVE_TOOLTIP_TEST_ID,
  INSTITUTION_ACTIVE_TOOLTIP_TEXT,
  INSTITUTION_AGGREGATOR_INSTITUTION_ID_TOOLTIP_TEST_ID,
  INSTITUTION_AGGREGATOR_INSTITUTION_ID_TOOLTIP_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_TABLE_ROW,
  INSTITUTION_ERROR_TEXT,
  INSTITUTION_JOB_TYPES_TOOLTIP_TEST_ID,
  INSTITUTION_JOB_TYPES_TOOLTIP_TEXT,
  INSTITUTION_KEYWORDS_TOOLTIP_TEST_ID,
  INSTITUTION_KEYWORDS_TOOLTIP_TEXT,
  INSTITUTION_LOGO_TOOLTIP_TEST_ID,
  INSTITUTION_LOGO_TOOLTIP_TEXT,
  INSTITUTION_OAUTH_TOOLTIP_TEST_ID,
  INSTITUTION_OAUTH_TOOLTIP_TEXT,
  INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEST_ID,
  INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEXT,
  INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEST_ID,
  INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEXT,
  INSTITUTION_UCP_ID_TOOLTIP_TEST_ID,
  INSTITUTION_UCP_ID_TOOLTIP_TEXT,
  INSTITUTION_URL_TOOLTIP_TEST_ID,
  INSTITUTION_URL_TOOLTIP_TEXT,
  INSTITUTIONS_BREADCRUMB_LINK_TEXT,
} from "./constants";
import { server } from "../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_INSTITUTIONS_URL } from "../api";
import { TRY_AGAIN_BUTTON_TEXT } from "../../shared/components/constants";
import { INSTITUTIONS_ROUTE } from "../../shared/constants/routes";
import { INSTITUTION_EDIT_DETAILS_BUTTON_TEXT } from "../ChangeInstitution/constants";

describe("<Institution />", () => {
  it("shows a loading state, renders all the fields, renders an edit button, and sorts the aggregator integrations by display name", async () => {
    render(<Institution />);

    await expectSkeletonLoader();

    await Promise.all(
      [
        testInstitutionActiveAndInactive.id,
        testInstitutionActiveAndInactive.logo,
        testInstitutionActiveAndInactive.url,
        testInstitutionActiveAndInactive.name,
        testInstitutionActiveAndInactive.keywords.join(", "),
        testInstitutionActiveAndInactive.routing_numbers.join(", "),
        testInstitutionActiveAndInactive.aggregatorIntegrations[0].id,
        testInstitutionActiveAndInactive.aggregatorIntegrations[1].id,
        "Active",
        "Inactive",
        "Yes",
        "No",
        "Aggregation",
        "Identification",
        "Full History",
        "Verification",
      ].map(async (text) =>
        expect((await screen.findAllByText(text)).length).toBeGreaterThan(0),
      ),
    );

    expect(
      screen.getByRole("button", {
        name: INSTITUTION_EDIT_DETAILS_BUTTON_TEXT,
      }),
    ).toBeInTheDocument();

    const aggregatorIntegrationTableRows = screen.getAllByTestId(
      INSTITUTION_AGGREGATOR_INTEGRATION_TABLE_ROW,
    );

    expect(
      within(aggregatorIntegrationTableRows[0]).getByText(
        testInstitutionActiveAndInactive.aggregatorIntegrations[1].aggregator
          .displayName,
      ),
    ).toBeInTheDocument();
    expect(
      within(aggregatorIntegrationTableRows[1]).getByText(
        testInstitutionActiveAndInactive.aggregatorIntegrations[0].aggregator
          .displayName,
      ),
    ).toBeInTheDocument();
  });

  it("shows an error and allows retry", async () => {
    server.use(
      http.get(
        `${INSTITUTION_SERVICE_INSTITUTIONS_URL}/:institutionId`,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(<Institution />);

    expect(await screen.findByText(INSTITUTION_ERROR_TEXT)).toBeInTheDocument();

    server.use(
      http.get(`${INSTITUTION_SERVICE_INSTITUTIONS_URL}/:institutionId`, () =>
        HttpResponse.json(institutionResponse),
      ),
    );

    await userEvent.click(screen.getByText(TRY_AGAIN_BUTTON_TEXT));

    expect(
      await screen.findByText(testInstitutionActiveAndInactive.logo),
    ).toBeInTheDocument();
  });

  it("navigates to institutions when clicking the link", async () => {
    render(<Institution />);

    expect(
      await screen.findByText(testInstitutionActiveAndInactive.logo),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("link", { name: INSTITUTIONS_BREADCRUMB_LINK_TEXT }),
    );

    expectLocation(INSTITUTIONS_ROUTE);
  });

  it("renders all the tooltips", async () => {
    render(<Institution />);

    expect(
      await screen.findByText(testInstitutionActiveAndInactive.logo),
    ).toBeInTheDocument();

    for (const current of [
      [INSTITUTION_ACTIVE_TOOLTIP_TEST_ID, INSTITUTION_ACTIVE_TOOLTIP_TEXT],
      [
        INSTITUTION_AGGREGATOR_INSTITUTION_ID_TOOLTIP_TEST_ID,
        INSTITUTION_AGGREGATOR_INSTITUTION_ID_TOOLTIP_TEXT,
      ],
      [
        INSTITUTION_JOB_TYPES_TOOLTIP_TEST_ID,
        INSTITUTION_JOB_TYPES_TOOLTIP_TEXT,
      ],
      [INSTITUTION_KEYWORDS_TOOLTIP_TEST_ID, INSTITUTION_KEYWORDS_TOOLTIP_TEXT],
      [INSTITUTION_LOGO_TOOLTIP_TEST_ID, INSTITUTION_LOGO_TOOLTIP_TEXT],
      [INSTITUTION_OAUTH_TOOLTIP_TEST_ID, INSTITUTION_OAUTH_TOOLTIP_TEXT],
      [
        INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEST_ID,
        INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEXT,
      ],
      [INSTITUTION_UCP_ID_TOOLTIP_TEST_ID, INSTITUTION_UCP_ID_TOOLTIP_TEXT],
      [INSTITUTION_URL_TOOLTIP_TEST_ID, INSTITUTION_URL_TOOLTIP_TEXT],
      [
        INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEST_ID,
        INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEXT,
      ],
    ]) {
      const [testId, text] = current;

      expect(screen.queryByText(text)).not.toBeInTheDocument();

      await userEvent.hover(screen.getByTestId(testId));

      expect(await screen.findByText(text)).toBeInTheDocument();
    }
  });
});
