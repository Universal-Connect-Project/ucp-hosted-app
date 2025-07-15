import { WIDGET_DEMO_PAGE_TITLE } from "../../src/Demo/constants";
import { SIDE_NAV_DEMO_LINK_TEXT } from "../../src/Layout/constants";

describe("Widget Demo", () => {
  it("should load the demo landing page and display initial state", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.contains(WIDGET_DEMO_PAGE_TITLE).should("be.visible");
    cy.get('button[role="tab"]').contains("Connect").should("be.visible");
    cy.get('button[role="tab"]').contains("Connections").should("be.visible");
    cy.get('input[name="accountNumber"]').should("be.checked");
    cy.get('[data-testid="aggregator-select"]').should("contain", "MX");
    cy.contains("button", "Launch").should("be.visible");
  });

  it("should show an error if no job types are selected", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.get('input[name="accountNumber"]').uncheck();
    cy.contains("button", "Launch").click();
    cy.contains("Please select at least one job type.").should("be.visible");
  });

  it("should launch the demo with correct parameters for MX", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.get('input[name="accountOwner"]').check();
    cy.contains("button", "Launch").click();

    cy.get('[data-testid="demo-component"]').should("be.visible");
    cy.get("iframe")
      .its("0.contentDocument")
      .its("body")
      .within(() => {
        cy.findByText("Select your institution").should("exist");
      });
  });

  it("should launch the demo with correct parameters for Sophtron", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.get('[data-testid="aggregator-select"]').click();
    cy.get('li[data-value="Sophtron"]').click();
    cy.get('input[name="transactions"]').check();
    cy.get('input[name="transactionHistory"]').check();
    cy.contains("button", "Launch").click();

    cy.get('[data-testid="demo-component"]').should("be.visible");
    cy.get("iframe")
      .its("0.contentDocument")
      .its("body")
      .within(() => {
        cy.findByText("Select your institution").should("exist");
      });
  });

  it("should reset the form when the reset button is clicked", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.contains("button", "Launch").click();

    cy.get('[data-testid="demo-component"]').should("be.visible");
    cy.get('button:contains("Reset")').click();
    cy.get('[data-testid="demo-component"]').should("not.exist");
    cy.contains("h3", "Configuration").should("be.visible");
  });

  it("should switch to the Connections tab", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.get('button[role="tab"]').contains("Connections").click();
    cy.contains("h3", "Configuration").should("not.exist");
  });
});
