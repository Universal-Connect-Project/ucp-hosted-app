import { WIDGET_DEMO_PAGE_TITLE } from "../../src/Demo/constants";
import { SIDE_NAV_DEMO_LINK_TEXT } from "../../src/Layout/constants";

describe("Widget Demo", () => {
  it("should load the demo landing page and display initial state", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.contains(WIDGET_DEMO_PAGE_TITLE).should("be.visible");
    cy.findByRole("tab", { name: "Connect" }).should("be.visible");
    cy.findByRole("tab", { name: "Connections" }).should("be.visible");
    cy.findByLabelText("Account Number").should("be.checked");
    cy.findByRole("combobox", { name: "Aggregator" }).should("contain", "MX");
    cy.findByRole("button", { name: "Launch" }).should("be.visible");
  });

  it("should show an error if no job types are selected", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.findByLabelText("Account Number").uncheck();
    cy.findByRole("button", { name: "Launch" }).click();
    cy.contains("Please select at least one job type.").should("be.visible");
  });

  it("should launch the demo with correct parameters for MX", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.findByLabelText("Account Owner").check();
    cy.findByRole("button", { name: "Launch" }).click();
    cy.findByTestId("demo-component").should("be.visible");
    cy.get("iframe")
      .invoke("attr", "src")
      .should("include", "jobTypes=accountNumber,accountOwner")
      .and("include", "aggregatorOverride=mx");
    cy.get("iframe")
      .its("0.contentDocument")
      .its("body")
      .within(() => {
        cy.findByText("Select your institution").should("exist");
      });
  });

  it.only("should make a connection to mx bank", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.findByRole("button", { name: "Launch" }).click();
    cy.findByTestId("demo-component").should("be.visible");
    cy.get("iframe")
      .its("0.contentDocument")
      .its("body")
      .within(() => {
        cy.findByText("Select your institution").should("exist");
        cy.findByText("MX Bank").click();
        cy.findByLabelText("Username").type("mxuser");
        cy.findByLabelText("Password").type("correct");
        cy.findByText("Continue").click();
        cy.wait(12000); // Wait for the connection to process
        cy.findByText("You have successfully connected to MX Bank.").should(
          "exist",
        );
      });
  });

  it("should launch the demo with correct parameters for Sophtron", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.findByTestId("aggregator-select").click();
    cy.findByText("Sophtron").click();
    cy.findByLabelText("Transactions").check();
    cy.findByLabelText("Transaction History").check();
    cy.findByRole("button", { name: "Launch" }).click();
    cy.findByTestId("demo-component").should("be.visible");

    cy.get("iframe")
      .its("0.contentDocument")
      .its("body")
      .within(() => {
        cy.findByText("Select your institution").should("exist");
      });

    cy.get("iframe")
      .invoke("attr", "src")
      .should(
        "include",
        "jobTypes=accountNumber,transactions,transactionHistory",
      )
      .and("include", "aggregatorOverride=sophtron");
  });

  it("should reset the form when the reset button is clicked", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.findByRole("button", { name: "Launch" }).click();
    cy.findByTestId("demo-component").should("be.visible");
    cy.findByRole("button", { name: "Reset" }).click();
    cy.findByTestId("demo-component").should("not.exist");
    cy.findByText("Configuration").should("be.visible");
  });

  it("should switch to the Connections tab", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.findByRole("tab", { name: "Connections" }).click();
    cy.findByText("Connections Page Placeholder").should("be.visible");
    cy.findByText("Configuration").should("not.exist");
  });
});
