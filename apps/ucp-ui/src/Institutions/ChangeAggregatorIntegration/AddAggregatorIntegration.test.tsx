import React from "react";
import {
  render,
  screen,
  userEvent,
  waitFor,
} from "../../shared/test/testUtils";
import AddAggregatorIntegration from "./AddAggregatorIntegration";
import {
  INSTITUTION_CHANGE_AGGREGATOR_ERROR_TEXT,
  INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
  INSTITUTION_ADD_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
  INSTITUTION_ADD_AGGREGATOR_SUCCESS_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_ID_LABEL_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT,
} from "./constants";
import {
  testInstitution,
  testInstitutionPermissions,
} from "../testData/institutions";
import { REQUIRED_ERROR_TEXT } from "../../shared/constants/validation";
import { server } from "../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL } from "./api";
import { TRY_AGAIN_BUTTON_TEXT } from "../../shared/components/constants";
import { INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT } from "../ChangeInstitution/constants";

const openDrawer = async () =>
  await userEvent.click(
    screen.getByRole("button", {
      name: INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
    }),
  );

const submitForm = async () =>
  await userEvent.click(
    await screen.findByRole("button", {
      name: INSTITUTION_ADD_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
    }),
  );

const getAggregatorInstitutionIdInput = async () =>
  await screen.findByLabelText(
    new RegExp(
      INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT,
    ),
  );

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

  it("renders a required error for aggregator and aggregatorInstitutionId for someone with access to all institutions", async () => {
    render(
      <AddAggregatorIntegration
        institution={testInstitution}
        permissions={{
          ...testInstitutionPermissions,
          hasAccessToAllAggregators: true,
        }}
      />,
    );

    await openDrawer();
    await submitForm();

    expect(await screen.findAllByText(REQUIRED_ERROR_TEXT)).toHaveLength(2);
  });

  it("doesn't submit if there is no job type selected but all the other fields are filled in", async () => {
    let requestMade = false;

    server.use(
      http.post(INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL, () => {
        requestMade = true;

        return HttpResponse.json({});
      }),
    );

    render(
      <AddAggregatorIntegration
        institution={testInstitution}
        permissions={{
          ...testInstitutionPermissions,
        }}
      />,
    );

    await openDrawer();

    await userEvent.type(await getAggregatorInstitutionIdInput(), "test");

    await submitForm();

    expect(screen.queryAllByText(REQUIRED_ERROR_TEXT)).toHaveLength(0);

    expect(requestMade).toBe(false);
  });

  it("selects your aggregator if you only have access to 1 and disables the input", async () => {
    render(
      <AddAggregatorIntegration
        institution={testInstitution}
        permissions={{
          ...testInstitutionPermissions,
        }}
      />,
    );

    await openDrawer();

    const aggregatorInput = (
      await screen.findAllByLabelText(
        new RegExp(
          INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_ID_LABEL_TEXT,
        ),
      )
    )[0];

    expect(aggregatorInput).toHaveAttribute("aria-disabled", "true");
    expect(await screen.findByRole("combobox")).toHaveTextContent(
      testInstitutionPermissions.aggregatorsThatCanBeAdded[0].displayName,
    );
  });

  it("shows an error message on failure, allows retry, and closes the drawer shows a success message on success", async () => {
    server.use(
      http.post(
        INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(
      <AddAggregatorIntegration
        institution={testInstitution}
        permissions={{
          ...testInstitutionPermissions,
          hasAccessToAllAggregators: true,
        }}
      />,
    );

    await openDrawer();

    await userEvent.type(await getAggregatorInstitutionIdInput(), "test");

    await userEvent.click(
      (
        await screen.findAllByLabelText(
          new RegExp(
            INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_ID_LABEL_TEXT,
          ),
        )
      )[0],
    );

    await userEvent.click(
      await screen.findByRole("option", {
        name: testInstitutionPermissions.aggregatorsThatCanBeAdded[0]
          .displayName,
      }),
    );

    await userEvent.click(screen.getByText("Aggregation"));

    await submitForm();

    expect(
      await screen.findByText(INSTITUTION_CHANGE_AGGREGATOR_ERROR_TEXT),
    ).toBeInTheDocument();

    server.use(
      http.post(INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL, () =>
        HttpResponse.json({}),
      ),
    );

    await userEvent.click(await screen.findByText(TRY_AGAIN_BUTTON_TEXT));

    expect(
      await screen.findByText(INSTITUTION_ADD_AGGREGATOR_SUCCESS_TEXT),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.queryByLabelText(
          new RegExp(
            INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT,
          ),
        ),
      ).not.toBeInTheDocument(),
    );
  });

  it("closes the drawer on button click and resets the form when reopening the drawer", async () => {
    render(
      <AddAggregatorIntegration
        institution={testInstitution}
        permissions={{
          ...testInstitutionPermissions,
        }}
      />,
    );

    await openDrawer();

    await userEvent.type(await getAggregatorInstitutionIdInput(), "test");

    expect(await getAggregatorInstitutionIdInput()).toHaveValue("test");

    await userEvent.click(
      screen.getByRole("button", {
        name: INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
      }),
    );

    await openDrawer();

    expect(await getAggregatorInstitutionIdInput()).toHaveValue("");
  });
});
