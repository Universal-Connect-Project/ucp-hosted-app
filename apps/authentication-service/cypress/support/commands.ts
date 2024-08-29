/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";
import { JwtPayload } from "jsonwebtoken";

import { DefaultPermissions, UiClientPermissions } from "@repo/shared-utils";

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
  storageKey: string;
  grantType: "password" | "client_credentials";
  audience: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
  usernameEnvKey?: string;
  passwordEnvKey?: string;
};

const login = (args: LoginArgs) => {
  const {
    usernameEnvKey,
    passwordEnvKey,
    scope,
    storageKey,
    grantType,
    audience,
    clientId,
    clientSecret,
  } = args;

  const username = Cypress.env(usernameEnvKey) as string;
  const password = Cypress.env(passwordEnvKey) as string;

  const body =
    grantType === "password"
      ? {
          username,
          password,
          grant_type: grantType,
          scope,
          audience,
          client_id: clientId,
        }
      : {
          grant_type: grantType,
          scope,
          audience,
          client_id: clientId,
          client_secret: clientSecret,
        };

  cy.request({
    method: "POST",
    url: `https://${Cypress.env("AUTH0_DOMAIN")}/oauth/token`,
    body,
  }).then((response: Cypress.Response<JwtPayload>) => {
    cy.window().then((win: Cypress.AUTWindow) =>
      win.localStorage.setItem(
        storageKey,
        response.body.access_token as string,
      ),
    );
  });
};

const clientLoginArgs: LoginArgs = {
  usernameEnvKey: "AUTH_USERNAME_WITH_KEY_ROLES",
  passwordEnvKey: "AUTH_PASSWORD_WITH_KEY_ROLES",
  grantType: "password",
  audience: Cypress.env("AUTH0_CLIENT_AUDIENCE") as string,
  clientId: Cypress.env("E2E_CLIENT_ID") as string,
  clientSecret: Cypress.env("E2E_CLIENT_SECRET") as string,
  scope: "",
  storageKey: "",
};

Cypress.Commands.add("loginWithKeyRoles", () => {
  login({
    ...clientLoginArgs,
    storageKey: "jwt-with-key-roles",
    scope: `${Object.values(DefaultPermissions).join(" ")} ${Object.values(UiClientPermissions).join(" ")}`,
  });
});

Cypress.Commands.add("loginWithoutKeyRoles", () => {
  login({
    ...clientLoginArgs,
    storageKey: "jwt-without-key-roles",
    scope: `${Object.values(DefaultPermissions).join(" ")}`,
  });
});

type ClientKeys = { clientId: string; clientSecret: string };

Cypress.Commands.add("loginWidgetHost", (clientKeys: ClientKeys) => {
  const { clientId, clientSecret } = clientKeys;

  login({
    storageKey: "jwt-widget-m2m",
    grantType: "client_credentials",
    audience: Cypress.env("AUTH0_WIDGET_AUDIENCE") as string,
    clientId: clientId,
    clientSecret: clientSecret,
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginWithKeyRoles(): void;
      loginWithoutKeyRoles(): void;
      loginWidgetHost(clientKeys: ClientKeys): string;
    }
  }
}
