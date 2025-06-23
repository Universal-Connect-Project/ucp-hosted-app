import { navigateToPerformance } from "../shared/navigation";
import {
  AGGREGATORS_LABEL_TEXT,
  JOB_TYPES_LABEL_TEXT,
  TIME_FRAME_LABEL_TEXT,
} from "../../src/shared/components/Forms/constants";
import { oneHundredEightyDaysOption } from "../../src/shared/components/Forms/constants";
import { supportsJobTypeMap } from "../../src/shared/constants/jobTypes";

describe("performance", () => {
  it("shows the performance charts and filters", () => {
    cy.loginWithoutWidgetRole();
    cy.visit("/");
    navigateToPerformance();

    cy.findAllByText("MX").should("have.length", 3);

    cy.get(".MuiMarkElement-root").should("have.length.at.least", 4);

    cy.findByLabelText(AGGREGATORS_LABEL_TEXT).click();

    cy.findByRole("option", { name: "Sophtron" }).click().type("{esc}");

    cy.findAllByText("MX").should("have.length", 1);

    cy.findAllByLabelText(TIME_FRAME_LABEL_TEXT).eq(0).click();

    cy.findByRole("option", { name: oneHundredEightyDaysOption.label }).click();

    cy.findByLabelText(JOB_TYPES_LABEL_TEXT).click();

    cy.findByRole("option", {
      name: supportsJobTypeMap.transactions.displayName,
    })
      .click()
      .type("{esc}");

    cy.waitForLoad();

    cy.get(".MuiMarkElement-root").should("have.length.at.least", 2);
  });

  it("shows aggregators and performance data by job type and filters", () => {
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

    cy.findAllByLabelText(TIME_FRAME_LABEL_TEXT).eq(1).click();

    cy.findByRole("option", { name: oneHundredEightyDaysOption.label }).click();

    cy.waitForLoad();

    cy.findAllByText(percentAndDurationDataRegex).should(
      "have.length.at.least",
      1,
    );
  });
});
