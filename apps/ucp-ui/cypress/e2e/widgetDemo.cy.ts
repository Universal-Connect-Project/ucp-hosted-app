import { WIDGET_DEMO_PAGE_TITLE } from "../../src/WidgetDemo/constants";
import { SIDE_NAV_DEMO_LINK_TEXT } from "../../src/Layout/constants";

describe("Widget Demo", () => {
  it("should launch the demo widget with MX and make a connection", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();
    cy.findByText(WIDGET_DEMO_PAGE_TITLE).should("be.visible");
    cy.findByRole("tab", { name: "Connect" }).should("be.visible");
    cy.findByLabelText("Account Number").click();
    cy.findByLabelText("Account Number").should("be.checked");
    cy.findByRole("combobox", { name: "Aggregator" }).click();
    cy.findByRole("option", { name: "MX" }).click();
    cy.findByRole("combobox", { name: "Aggregator" }).should("contain", "MX");
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
        cy.findByText("You have successfully connected to MX Bank.").should(
          "exist",
          { timeout: 120000 },
        );
      });

    cy.findByRole("button", { name: "Reset" }).click();
    cy.findByTestId("demo-component").should("not.exist");
    cy.findByText("Configuration").should("be.visible");
    cy.findByRole("tab", { name: "Connections" }).click();
    cy.findByText("MX Bank").should("exist");
    cy.findByText("Account Number").should("exist");
    cy.findByText("MX").should("exist");
  });

  it("shows sophtron banks when selecting sophtron as the aggregator", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();

    cy.findByLabelText("Account Number").click();

    cy.findByRole("combobox", { name: "Aggregator" }).click();
    cy.findByRole("option", { name: "Sophtron" }).click();

    cy.findByRole("button", { name: "Launch" }).click();

    cy.get("iframe")
      .its("0.contentDocument")
      .its("body")
      .within(() => {
        cy.findByText("Select your institution").should("exist");
        cy.findByText("Sophtron Bank NoMFA").should("be.visible");
      });
  });

  it.only("shows finicity banks when selecting finicity as the aggregator", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }).click();

    cy.findByLabelText("Account Number").click();

    cy.findByRole("combobox", { name: "Aggregator" }).click();
    cy.findByRole("option", { name: "Finicity" }).click();

    cy.findByRole("button", { name: "Launch" }).click();

    cy.get("iframe")
      .its("0.contentDocument")
      .its("body")
      .within(() => {
        cy.findByText("Select your institution").should("exist");
        cy.findByText("FinBank").should("be.visible");
      });
  });
});
