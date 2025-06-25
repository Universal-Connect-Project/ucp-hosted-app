import { SIDE_NAV_DEMO_LINK_TEXT } from "../../src/Layout/constants";

describe("Demo Widget", () => {
  it("navigates to the demo page", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();

    cy.get("iframe")
      .its("0.contentDocument")
      .its("body")
      .within(() => {
        cy.findByText("Select your institution").should("exist");
      });
  });
});
