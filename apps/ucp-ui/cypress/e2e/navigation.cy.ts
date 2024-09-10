import { API_KEYS_CARD_TITLE_TEXT } from "../../src/ApiKeys/constants";
import { SIDE_NAV_LOG_OUT_BUTTON_TEXT } from "../../src/Layout/constants";
import {
  navigateToInstitutions,
  navigateToWidgetManagement,
} from "../shared/navigation";
import { INSTITUTIONS_PAGE_TITLE } from "../../src/Institutions/constants";

describe("Health", () => {
  it("renders a not found page", () => {
    cy.loginWithWidgetRole();
    cy.visit("/ninjas");

    cy.findByText("Something went wrong").should("exist");
  });

  it("navigates to the different pages", () => {
    cy.loginWithWidgetRole();

    cy.visit("/");

    navigateToWidgetManagement();

    cy.findByText(API_KEYS_CARD_TITLE_TEXT).should("exist");

    navigateToInstitutions();

    cy.findAllByText(INSTITUTIONS_PAGE_TITLE).should("have.length", 2);
  });

  it("logs you out", () => {
    cy.loginWithWidgetRole();
    cy.visit("/");

    cy.findByText(SIDE_NAV_LOG_OUT_BUTTON_TEXT).click();

    cy.url().should("not.equal", Cypress.config("baseUrl"));
  });
});
