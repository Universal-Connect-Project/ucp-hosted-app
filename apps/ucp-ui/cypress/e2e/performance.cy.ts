import { navigateToPerformance } from "../shared/navigation";

describe("performance", () => {
  it("shows the performance charts", () => {
    cy.loginWithWidgetRole();
    cy.visit("/");
    navigateToPerformance();

    cy.findAllByText("MX").should("have.length", 3);

    cy.get(".MuiMarkElement-root").should("have.length.at.least", 4);
  });

  it("shows aggregators and performance data by job type", () => {
    cy.loginWithoutWidgetRole();
    cy.visit("/");

    navigateToPerformance();

    cy.findAllByText("MX").should("have.length", 3);

    const percentDataRegex = /^\d+(?:\.\d+)?%$/;
    cy.findAllByText(percentDataRegex).should("have.length.at.least", 1);

    const durationDataRegex = /^\d+(?:\.\d+)?s$/;
    cy.findAllByText(durationDataRegex).should("have.length.at.least", 1);

    const percentAndDurationDataRegex =
      /^\d+(?:\.\d+)?%\s*\|\s*\d+(?:\.\d+)?s$/;

    cy.findAllByText(percentAndDurationDataRegex).should(
      "have.length.at.least",
      1,
    );
  });
});
