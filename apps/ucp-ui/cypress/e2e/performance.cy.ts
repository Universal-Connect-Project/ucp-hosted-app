import { navigateToPerformance } from "../shared/navigation";

describe("performance", () => {
  it("shows aggregators and performance data", () => {
    cy.loginWithoutWidgetRole();
    cy.visit("/");

    navigateToPerformance();

    cy.findByText("MX").should("exist");

    cy.findAllByText(/^\d+(?:\.\d+)?%$/).should("have.length.at.least", 1);
    cy.findAllByText(/^\d+(?:\.\d+)?s$/).should("have.length.at.least", 1);

    cy.findAllByText(/^\d+(?:\.\d+)?%\s*\|\s*\d+(?:\.\d+)?s$/).should(
      "have.length.at.least",
      1,
    );
  });
});
