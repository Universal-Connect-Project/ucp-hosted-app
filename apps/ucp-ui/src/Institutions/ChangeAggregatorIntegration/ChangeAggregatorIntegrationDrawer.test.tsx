import React from "react";
import { render, screen, userEvent } from "../../shared/test/testUtils";
import AddAggregatorIntegration from "./AddAggregatorIntegration";
import {
  INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
  INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_ID_LABEL_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT,
  INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
} from "./constants";
import {
  testInstitution,
  testInstitutionPermissions,
} from "../testData/institutions";
import { REQUIRED_ERROR_TEXT } from "../../shared/constants/validation";
import { server } from "../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL } from "./api";
import { INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT } from "../ChangeInstitution/constants";
import EditAggregatorIntegration from "./EditAggregatorIntegration";

const openAddDrawer = async () =>
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

const getAggregatorInstitutionIdInput = async () =>
  await screen.findByLabelText(
    new RegExp(
      INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT,
    ),
  );

describe("ChangeAggregatorIntegration", () => {
  describe("add integration", () => {
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

      await openAddDrawer();
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

      await openAddDrawer();

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

      await openAddDrawer();

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

    it("closes the drawer on button click and resets the form when reopening the drawer", async () => {
      render(
        <AddAggregatorIntegration
          institution={testInstitution}
          permissions={{
            ...testInstitutionPermissions,
          }}
        />,
      );

      await openAddDrawer();

      await userEvent.type(await getAggregatorInstitutionIdInput(), "test");

      expect(await getAggregatorInstitutionIdInput()).toHaveValue("test");

      await userEvent.click(
        screen.getByRole("button", {
          name: INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
        }),
      );

      await openAddDrawer();

      expect(await getAggregatorInstitutionIdInput()).toHaveValue("");
    });

    it("doesn't render a remove button", async () => {
      render(
        <AddAggregatorIntegration
          institution={testInstitution}
          permissions={{
            ...testInstitutionPermissions,
          }}
        />,
      );

      await openAddDrawer();

      expect(
        screen.queryByRole("button", {
          name: INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe("edit integration", () => {
    it("doesn't render an aggregator select, renders a remove button if they have access, and renders the aggregator name if an integrationId is provided", () => {
      const aggregatorIntegration = testInstitution.aggregatorIntegrations[1];

      render(
        <EditAggregatorIntegration
          aggregatorIntegrationId={aggregatorIntegration.id}
          institution={testInstitution}
          isOpen={true}
          permissions={{
            ...testInstitutionPermissions,
          }}
          setIsOpen={() => {}}
        />,
      );

      expect(
        screen.getByText(aggregatorIntegration.aggregator.displayName),
      ).toBeInTheDocument();

      expect(
        screen.queryByLabelText(
          INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_ID_LABEL_TEXT,
        ),
      ).not.toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
        }),
      ).toBeInTheDocument();
    });

    it("doesn't render a remove button if they don't have access to delete", () => {
      const aggregatorIntegration = testInstitution.aggregatorIntegrations[0];

      render(
        <EditAggregatorIntegration
          aggregatorIntegrationId={aggregatorIntegration.id}
          institution={testInstitution}
          isOpen={true}
          permissions={{
            ...testInstitutionPermissions,
          }}
          setIsOpen={() => {}}
        />,
      );

      expect(
        screen.getByText(aggregatorIntegration.aggregator.displayName),
      ).toBeInTheDocument();

      expect(
        screen.queryByLabelText(
          INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_ID_LABEL_TEXT,
        ),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole("button", {
          name: INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
        }),
      ).not.toBeInTheDocument();
    });
  });
});
