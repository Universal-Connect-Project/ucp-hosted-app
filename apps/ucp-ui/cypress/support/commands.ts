/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";
import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from "../../src/shared/constants/authentication";
import { SKELETON_LOADER_TEST_ID } from "../../src/shared/components/constants";
import { AUTH0_ORIGIN } from "../shared/constants";
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

const login = (usernameEnvKey: string, passwordEnvKey: string) => {
  const username = Cypress.env(usernameEnvKey) as string;
  const password = Cypress.env(passwordEnvKey) as string;

  cy.visit("/");

  cy.origin(
    AUTH0_ORIGIN,
    { args: { username, password } },
    ({ username, password }) => {
      cy.get("input#username").type(username);
      cy.get("input#password").type(password, { log: false });
      cy.contains("button[value=default]", "Continue").click();
    },
  );

  cy.url().should("equal", Cypress.config("baseUrl"));
};

Cypress.Commands.add("loginWithWidgetRole", () =>
  login("auth_username_with_widget_role", "auth_password_with_widget_role"),
);

Cypress.Commands.add("loginWithoutWidgetRole", () =>
  login(
    "auth_username_without_widget_role",
    "auth_password_without_widget_role",
  ),
);

Cypress.Commands.add("loginWithWidgetDemoPermissions", () =>
  login(
    "auth_username_with_widget_demo_permissions",
    "auth_password_with_widget_demo_permissions",
  ),
);

Cypress.Commands.add("loginSuperAdmin", () =>
  login("auth_username_super_admin", "auth_password_super_admin"),
);

Cypress.Commands.add("getAccessToken", () =>
  cy.wrap(localStorage).invoke("getItem", ACCESS_TOKEN_LOCAL_STORAGE_KEY),
);

Cypress.Commands.add("waitForLoad", () => {
  cy.findAllByTestId(SKELETON_LOADER_TEST_ID).should("have.length", 0);
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getAccessToken(): Chainable<string>;
      loginSuperAdmin(): Chainable<void>;
      loginWithWidgetRole(): Chainable<void>;
      loginWithoutWidgetRole(): Chainable<void>;
      waitForLoad(): Chainable<void>;
      loginWithWidgetDemoPermissions(): Chainable<void>;
    }
  }
}
