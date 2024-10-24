import { INSTITUTIONS_ROW_TEST_ID } from "../../src/Institutions/constants";
import { INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_BUTTON_TEST_ID } from "../../src/Institutions/Institution/constants";
import {
  INSTITUTION_ADD_SUCCESS_TEXT,
  INSTITUTION_EDIT_DETAILS_BUTTON_TEXT,
  INSTITUTION_EDIT_SUCCESS_TEXT,
  INSTITUTION_FORM_ADD_KEYWORD_BUTTON_TEXT,
  INSTITUTION_FORM_ADD_ROUTING_NUMBER_BUTTON_TEXT,
  INSTITUTION_FORM_KEYWORD_LABEL_TEXT,
  INSTITUTION_FORM_LOGO_URL_LABEL_TEXT,
  INSTITUTION_FORM_NAME_LABEL_TEXT,
  INSTITUTION_FORM_ROUTING_NUMBER_LABEL_TEXT,
  INSTITUTION_FORM_SUBMIT_BUTTON_TEXT,
  INSTITUTION_FORM_URL_LABEL_TEXT,
  INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
} from "../../src/Institutions/ChangeInstitution/constants";
import {
  INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
  INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
  INSTITUTION_ADD_AGGREGATOR_SUCCESS_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_ID_LABEL_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT,
  INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_SUCCESS_TEXT,
} from "../../src/Institutions/ChangeAggregatorIntegration/constants";

describe("institutions", () => {
  it("renders institutions, changes rows per page, and paginates", () => {
    cy.loginWithoutWidgetRole();

    const rowRegex = new RegExp(INSTITUTIONS_ROW_TEST_ID);

    cy.findAllByTestId(rowRegex).should("exist");

    cy.waitForLoad();

    cy.findAllByTestId(rowRegex).should("have.length", 10);

    cy.findByText("10").click();

    cy.findByText("25").click();

    cy.waitForLoad();

    cy.findAllByTestId(rowRegex).should("have.length", 25);

    cy.findAllByTestId(rowRegex)
      .eq(0)
      .invoke("attr", "data-testid")
      .then((firstPageTestId) => {
        cy.findByTestId("NavigateNextIcon").click();

        cy.waitForLoad();

        cy.findByTestId("NavigateNextIcon").click();

        cy.waitForLoad();

        cy.findAllByTestId(rowRegex)
          .eq(0)
          .invoke("attr", "data-testid")
          .should("not.eq", firstPageTestId);
      });
  });

  it("creates an institution, navigates to its page, edits the institution, adds an aggregator integration, and edits that aggregator integration", () => {
    cy.loginSuperAdmin();

    cy.findByRole("button", {
      name: INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
    }).click();

    cy.findByLabelText(new RegExp(INSTITUTION_FORM_NAME_LABEL_TEXT)).type(
      "Delete Me",
    );
    cy.findByLabelText(new RegExp(INSTITUTION_FORM_URL_LABEL_TEXT)).type(
      "http://delete",
    );
    cy.findByLabelText(new RegExp(INSTITUTION_FORM_LOGO_URL_LABEL_TEXT)).type(
      "http://delete",
    );

    cy.findByRole("button", {
      name: INSTITUTION_FORM_ADD_ROUTING_NUMBER_BUTTON_TEXT,
    }).click();
    cy.findByLabelText(INSTITUTION_FORM_ROUTING_NUMBER_LABEL_TEXT).type(
      "123456789",
    );

    cy.findByRole("button", {
      name: INSTITUTION_FORM_ADD_KEYWORD_BUTTON_TEXT,
    }).click();
    cy.findByLabelText(INSTITUTION_FORM_KEYWORD_LABEL_TEXT).type("Delete");

    cy.findByRole("button", {
      name: INSTITUTION_FORM_SUBMIT_BUTTON_TEXT,
    }).click();

    cy.findByText(INSTITUTION_ADD_SUCCESS_TEXT).should("exist");

    cy.location().then((location) => {
      const institutionId = location.pathname.split("/").pop();

      cy.findByText(institutionId).should("exist");
    });

    cy.findByRole("button", {
      name: INSTITUTION_EDIT_DETAILS_BUTTON_TEXT,
    }).click();

    cy.findByLabelText(new RegExp(INSTITUTION_FORM_NAME_LABEL_TEXT)).type(
      " Edited",
    );

    cy.findByRole("button", {
      name: INSTITUTION_FORM_SUBMIT_BUTTON_TEXT,
    }).click();

    cy.findByText(INSTITUTION_EDIT_SUCCESS_TEXT).should("exist");

    cy.findByRole("button", {
      name: INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
    }).click();

    cy.findAllByLabelText(
      new RegExp(
        INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_ID_LABEL_TEXT,
      ),
    )
      .eq(0)
      .click();

    cy.findByRole("option", { name: "Test Example A" }).click();

    cy.findByRole("checkbox", { name: "Aggregation" }).click();

    cy.findByLabelText(
      new RegExp(
        INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT,
      ),
    ).type("testaggregatorinstitutionid");

    cy.findByRole("button", {
      name: INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
    }).click();

    cy.findByText(INSTITUTION_ADD_AGGREGATOR_SUCCESS_TEXT).should("exist");

    cy.findByTestId(
      INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_BUTTON_TEST_ID,
    ).click();

    cy.findByLabelText(
      new RegExp(
        INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT,
      ),
    ).type(" edited");

    cy.findByRole("button", {
      name: INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
    }).click();

    cy.findByText(INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_SUCCESS_TEXT).should(
      "exist",
    );

    cy.findByText("testaggregatorinstitutionid edited").should("exist");
  });
});
