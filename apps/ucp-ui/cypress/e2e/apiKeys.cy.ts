import {
  API_KEYS_CARD_TITLE_TEXT,
  REQUEST_API_KEY_ACCESS_BUTTON_TEXT,
} from "../../src/ApiKeys/constants";

describe("apiKeys", () => {
  it("renders the request api keys screen for a user without the widget role and without keys", () => {
    cy.loginWithoutWidgetRole();

    cy.findByText(REQUEST_API_KEY_ACCESS_BUTTON_TEXT).should("exist");
  });

  it("doesnt render the request api keys screen for a user with the widget role", () => {
    cy.loginWithWidgetRole();

    cy.findByText(API_KEYS_CARD_TITLE_TEXT).should("exist");
    cy.findByText(REQUEST_API_KEY_ACCESS_BUTTON_TEXT).should("not.exist");
  });
});
