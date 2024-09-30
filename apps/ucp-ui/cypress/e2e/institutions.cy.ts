import { INSTITUTIONS_ROW_TEST_ID } from "../../src/Institutions/constants";
import {
  INSTITUTION_ADD_SUCCESS_TEXT,
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

        cy.findAllByTestId(rowRegex)
          .eq(0)
          .invoke("attr", "data-testid")
          .should("not.eq", firstPageTestId);
      });
  });

  it("creates an institution and navigates to its page", () => {
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
  });
});
