import React from "react";
import {
  expectSkeletonLoader,
  render,
  screen,
  userEvent,
  waitFor,
} from "../../shared/test/testUtils";
import { INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_BUTTON_TEST_ID } from "./constants";
import {
  testInstitution,
  testInstitutionPermissions,
} from "../testData/institutions";
import { INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT } from "../ChangeAggregatorIntegration/constants";
import { server } from "../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import {
  EditAggregatorIntegrationParams,
  INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL,
} from "../ChangeAggregatorIntegration/api";
import AggregatorIntegrations from "./AggregatorIntegrations";

describe("<AggregatorIntegrations />", () => {
  it("only shows an edit button for the integrations the user has access to edit and calls edit with the correct variables", async () => {
    let body: EditAggregatorIntegrationParams, integrationId: string;

    server.use(
      http.put(
        `${INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL}/:integrationId`,
        async ({ request, params }) => {
          body = (await request.json()) as EditAggregatorIntegrationParams;
          integrationId = params.integrationId as string;

          return HttpResponse.json({});
        },
      ),
    );

    render(
      <AggregatorIntegrations
        institution={testInstitution}
        isLoading={false}
        permissions={testInstitutionPermissions}
      />,
    );

    expect(
      await screen.findAllByTestId(
        INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_BUTTON_TEST_ID,
      ),
    ).toHaveLength(1);

    expect(testInstitution.aggregatorIntegrations.length).toBeGreaterThan(1);

    await userEvent.click(
      await screen.findByTestId(
        INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_BUTTON_TEST_ID,
      ),
    );

    await userEvent.click(
      await screen.findByRole("button", {
        name: INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
      }),
    );

    const aggregatorIntegrationToBeEdited =
      testInstitution.aggregatorIntegrations[1];

    await waitFor(() => {
      expect(integrationId).toEqual(aggregatorIntegrationToBeEdited.id);
      expect(body).toEqual({
        aggregator_institution_id:
          aggregatorIntegrationToBeEdited.aggregator_institution_id,
        isActive: aggregatorIntegrationToBeEdited.isActive,
        supports_aggregation:
          aggregatorIntegrationToBeEdited.supports_aggregation,
        supports_history: aggregatorIntegrationToBeEdited.supports_history,
        supportsRewards: aggregatorIntegrationToBeEdited.supportsRewards,
        supportsBalance: aggregatorIntegrationToBeEdited.supportsBalance,
        supports_identification:
          aggregatorIntegrationToBeEdited.supports_identification,
        supports_oauth: aggregatorIntegrationToBeEdited.supports_oauth,
        supports_verification:
          aggregatorIntegrationToBeEdited.supports_verification,
      });
    });
  });

  it("renders a loading state", async () => {
    render(<AggregatorIntegrations isLoading />);

    await expectSkeletonLoader();
  });

  it("renders the correct chip labels for an active integration with support for oauth", () => {
    render(
      <AggregatorIntegrations
        institution={{
          ...testInstitution,
          aggregatorIntegrations: [
            {
              ...testInstitution.aggregatorIntegrations[0],
              isActive: true,
              supports_oauth: true,
            },
          ],
        }}
        isLoading={false}
        permissions={testInstitutionPermissions}
      />,
    );

    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.queryByText("No")).not.toBeInTheDocument();

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.queryByText("Inactive")).not.toBeInTheDocument();
  });

  it("renders the correct chip labels for an inactive integration without support for oauth", () => {
    render(
      <AggregatorIntegrations
        institution={{
          ...testInstitution,
          aggregatorIntegrations: [
            {
              ...testInstitution.aggregatorIntegrations[0],
              isActive: false,
              supports_oauth: false,
            },
          ],
        }}
        isLoading={false}
        permissions={testInstitutionPermissions}
      />,
    );

    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.queryByText("Yes")).not.toBeInTheDocument();

    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });
});
