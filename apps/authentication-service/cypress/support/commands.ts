/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";
import { DefaultPermissions, WidgetHostPermissions } from "@/shared/enums";
import { JwtPayload } from "jsonwebtoken";

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

type LoginArgs = {
  usernameEnvKey: string;
  passwordEnvKey: string;
  scope: string;
  storageKey: string;
};

const login = (args: LoginArgs) => {
  const { usernameEnvKey, passwordEnvKey, scope, storageKey } = args;

  const username = Cypress.env(usernameEnvKey) as string;
  const password = Cypress.env(passwordEnvKey) as string;
  const client_id = Cypress.env("E2E_CLIENT_ID") as string;
  const client_secret = Cypress.env("E2E_CLIENT_SECRET") as string;
  const audience = Cypress.env("AUTH0_CLIENT_AUDIENCE") as string;

  cy.request({
    method: "POST",
    url: `https://${Cypress.env("AUTH0_DOMAIN")}/oauth/token`,
    body: {
      grant_type: "password",
      scope,
      username,
      password,
      audience,
      client_id,
      client_secret,
    },
  }).then((response: Cypress.Response<JwtPayload>) => {
    cy.window().then((win: Cypress.AUTWindow) =>
      win.localStorage.setItem(
        storageKey,
        response.body.access_token as string,
      ),
    );
  });
};

Cypress.Commands.add("loginWithKeyRoles", () => {
  login({
    usernameEnvKey: "AUTH_USERNAME_WITH_KEY_ROLES",
    passwordEnvKey: "AUTH_PASSWORD_WITH_KEY_ROLES",
    scope: `${Object.values(DefaultPermissions).join(" ")} ${Object.values(WidgetHostPermissions).join(" ")}`,
    storageKey: "jwt-with-key-roles",
  });
});

Cypress.Commands.add("loginWithoutKeyRoles", () => {
  login({
    usernameEnvKey: "AUTH_USERNAME_WITHOUT_KEY_ROLES",
    passwordEnvKey: "AUTH_PASSWORD_WITHOUT_KEY_ROLES",
    scope: `${Object.values(DefaultPermissions).join(" ")}`,
    storageKey: "jwt-without-key-roles",
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginWithKeyRoles(): void;
      loginWithoutKeyRoles(): void;
    }
  }
}
