import { GENERIC_ERROR_TITLE_TEXT } from "../../src/GenericError/constants";
import { API_KEYS_CARD_TITLE_TEXT } from "../../src/ApiKeys/constants";
import { SIDE_NAV_LOG_OUT_BUTTON_TEXT } from "../../src/Layout/constants";
import { TERMS_AND_CONDITIONS_PAGE_TITLE_TEXT } from "../../src/TermsAndConditions/constants";
import { termsAndConditionsPublicRoute } from "../../src/shared/constants/routes";
import {
  navigateToInstitutions,
  navigateToPerformance,
  navigateToTermsAndConditions,
  navigateToWidgetManagement,
} from "../shared/navigation";
import { INSTITUTIONS_PAGE_TITLE } from "../../src/Institutions/constants";
import { AUTH0_ORIGIN } from "../shared/constants";
import { PERFORMANCE_PAGE_TITLE } from "../../src/Performance/constants";

describe("Health", () => {
  it("renders a generic error page", () => {
    cy.loginWithWidgetRole();
    cy.visit("/ninjas");

    cy.findByText(GENERIC_ERROR_TITLE_TEXT).should("exist");
  });

  it("navigates to the different pages", () => {
    cy.loginWithWidgetRole();

    cy.visit("/");

    navigateToWidgetManagement();

    cy.findByText(API_KEYS_CARD_TITLE_TEXT).should("exist");

    navigateToInstitutions();

    cy.findAllByText(INSTITUTIONS_PAGE_TITLE).should("have.length", 2);

    navigateToTermsAndConditions();

    cy.findByText(TERMS_AND_CONDITIONS_PAGE_TITLE_TEXT).should("exist");

    navigateToPerformance();

    cy.findByRole("heading", { name: PERFORMANCE_PAGE_TITLE }).should("exist");
  });

  it("lets you view the terms and conditions when logged out", () => {
    cy.visit(termsAndConditionsPublicRoute.fullRoute);

    cy.findByText(TERMS_AND_CONDITIONS_PAGE_TITLE_TEXT).should("exist");
  });

  it("shows the demo link when the user has the permission", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByText("Demo").should("exist");
  });

  it("does not show the demo link when the user does not have the permission", () => {
    cy.loginWithoutWidgetRole();
    cy.visit("/");
    cy.findByText("Demo").should("not.exist");
  });

  it("logs you out", () => {
    cy.loginWithWidgetRole();
    cy.visit("/");

    cy.findByText(SIDE_NAV_LOG_OUT_BUTTON_TEXT).click();

    cy.origin(AUTH0_ORIGIN, () => {
      cy.get("input#username").should("exist");
    });
  });
});
