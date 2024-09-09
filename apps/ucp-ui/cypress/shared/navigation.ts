import {
  SIDE_NAV_INSTITUTIONS_LINK_TEXT,
  SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
} from "../../src/Layout/constants";

export const navigateToWidgetManagement = () =>
  cy.findByRole("link", { name: SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT }).click();

export const navigateToInstitutions = () =>
  cy.findByRole("link", { name: SIDE_NAV_INSTITUTIONS_LINK_TEXT }).click();
