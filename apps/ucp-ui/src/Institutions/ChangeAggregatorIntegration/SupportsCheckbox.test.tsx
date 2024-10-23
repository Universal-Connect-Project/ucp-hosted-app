import React from "react";
import { render, screen, userEvent } from "../../shared/test/testUtils";
import AddAggregatorIntegration from "./AddAggregatorIntegration";
import {
  testInstitution,
  testInstitutionPermissions,
} from "../testData/institutions";
import {
  INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
  INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT,
} from "./constants";
import { server } from "../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL } from "./api";
import { INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT } from "../ChangeInstitution/constants";
import { supportsJobTypeMap } from "../../shared/constants/jobTypes";

const openDrawer = async () =>
  await userEvent.click(
    screen.getByRole("button", {
      name: INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
    }),
  );

const submitForm = async () =>
  await userEvent.click(
    await screen.findByRole("button", {
      name: INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
    }),
  );

describe("<SupportsCheckbox />", () => {
  it("allows submission if any of the job types are selected and renders each job types label and description", async () => {
    let submitCount = 0;

    server.use(
      http.post(INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL, () => {
        submitCount++;

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

    await submitForm();
    expect(submitCount).toBe(0);

    await userEvent.click(
      screen.getByRole("button", {
        name: INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
      }),
    );

    for (const jobType of Object.values(supportsJobTypeMap)) {
      const { description, displayName } = jobType;

      const startingSubmitCount = submitCount;

      await openDrawer();
      await userEvent.type(
        await screen.findByLabelText(
          new RegExp(
            INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT,
          ),
        ),
        "test",
      );
      expect(screen.getByText(description)).toBeInTheDocument();

      await userEvent.click(screen.getByLabelText(displayName));
      await submitForm();
      expect(submitCount).toBe(startingSubmitCount + 1);
    }
  });
});
