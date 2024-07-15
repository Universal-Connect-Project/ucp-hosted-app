/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";
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

Cypress.Commands.add("loginClientAuth0", () => {
  const username = Cypress.env("E2E_USERNAME") as string;
  const password = Cypress.env("E2E_PASSWORD") as string;
  const client_id = Cypress.env("E2E_CLIENT_ID") as string;
  const client_secret = Cypress.env("E2E_CLIENT_SECRET") as string;
  const audience = Cypress.env("AUTH0_AUDIENCE") as string;

  cy.request({
    method: "POST",
    url: `https://${Cypress.env("AUTH0_DOMAIN")}/oauth/token`,
    body: {
      grant_type: "password",
      scope: "openid offline_access profile email",
      username,
      password,
      audience,
      client_id,
      client_secret,
    },
  }).then((response: Cypress.Response<JwtPayload>) => {
    cy.window().then((win: Cypress.AUTWindow) =>
      win.localStorage.setItem(
        "jwt-client",
        response.body.access_token as string,
      ),
    );
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginClientAuth0(): void;
    }
  }
}
