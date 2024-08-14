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

Cypress.Commands.add("loginClientAuth0", (doUseRoleUser: boolean = true) => {
  const username = Cypress.env("AUTH_USERNAME_WITH_KEY_ROLES") as string;
  const password = Cypress.env("AUTH_PASSWORD_WITH_KEY_ROLES") as string;
  const usernameBasic = Cypress.env(
    "AUTH_USERNAME_WITHOUT_KEY_ROLES",
  ) as string;
  const passwordBasic = Cypress.env(
    "AUTH_PASSWORD_WITHOUT_KEY_ROLES",
  ) as string;
  const client_id = Cypress.env("E2E_CLIENT_ID") as string;
  const client_secret = Cypress.env("E2E_CLIENT_SECRET") as string;
  const audience = Cypress.env("AUTH0_CLIENT_AUDIENCE") as string;

  const scope = doUseRoleUser
    ? `${Object.values(DefaultPermissions).join(" ")} ${Object.values(WidgetHostPermissions).join(" ")}`
    : `${Object.values(DefaultPermissions).join(" ")}`;

  cy.request({
    method: "POST",
    url: `https://${Cypress.env("AUTH0_DOMAIN")}/oauth/token`,
    body: {
      grant_type: "password",
      scope,
      username: doUseRoleUser ? username : usernameBasic,
      password: doUseRoleUser ? password : passwordBasic,
      audience,
      client_id,
      client_secret,
    },
  }).then((response: Cypress.Response<JwtPayload>) => {
    cy.log("TOKEN:", response.body.access_token);
    cy.window().then((win: Cypress.AUTWindow) =>
      win.localStorage.setItem(
        doUseRoleUser ? "jwt-client" : "jwt-client-basic",
        response.body.access_token as string,
      ),
    );
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginClientAuth0(doAddRole?: boolean): void;
    }
  }
}
