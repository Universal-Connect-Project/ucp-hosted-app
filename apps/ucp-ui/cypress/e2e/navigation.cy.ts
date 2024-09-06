import { API_KEYS_CARD_TITLE_TEXT } from "../../src/ApiKeys/constants";
import {
  SIDE_NAV_LOG_OUT_BUTTON_TEXT,
  SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
} from "../../src/Layout/constants";

describe("Health", () => {
  it("renders a not found page", () => {
    cy.loginWithWidgetRole();
    cy.visit("/ninjas");

    cy.findByText("Something went wrong").should("exist");
  });

  it("navigates to widget management on click", () => {
    cy.loginWithWidgetRole();

    cy.visit("/");

    cy.findByRole("link", {
      name: SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
    }).click();

    cy.findByText(API_KEYS_CARD_TITLE_TEXT).should("exist");
  });

  it("logs you out", () => {
    cy.loginWithWidgetRole();
    cy.visit("/");

    cy.findByText(SIDE_NAV_LOG_OUT_BUTTON_TEXT).click();

    cy.url().should("not.equal", Cypress.config("baseUrl"));
  });
});
