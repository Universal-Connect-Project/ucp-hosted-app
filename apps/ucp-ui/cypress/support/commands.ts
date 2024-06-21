/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";
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

Cypress.Commands.add("login", () => {
  const username = Cypress.env("auth_username") as string;
  const password = Cypress.env("auth_password") as string;

  cy.visit("/");

  cy.origin(
    "dev-d23wau8o0uc5hw8n.us.auth0.com",
    { args: { username, password } },
    ({ username, password }) => {
      cy.get("input#username").type(username);
      cy.get("input#password").type(password, { log: false });
      cy.contains("button[value=default]", "Continue").click();
    },
  );

  cy.url().should("equal", Cypress.config("baseUrl"));
});

// Cypress.Commands.add("login", () => {
//   const domain = "dev-d23wau8o0uc5hw8n.us.auth0.com";

//   const username = Cypress.env("auth_username") as string;
//   const password = Cypress.env("auth_password") as string;
//   const client_id = "osS8CuafkPsJlfz5mfKRgYH942Pmwpxd";
//   const client_secret = Cypress.env("auth0_client_secret") as string;
//   const audience = Cypress.env(`${domain}/api/v2/`);

//   cy.request({
//     method: "POST",
//     url: `https://${domain}/oauth/token`,
//     body: {
//       grant_type: "password",
//       username,
//       password,
//       audience,
//       client_id,
//       client_secret,
//     },
//   }).then(({ body }) => {
//     const claims = jwtDecode(body.access_token) as Record<string, any>;
//     const {
//       nickname,
//       name,
//       picture,
//       updated_at,
//       email,
//       email_verified,
//       sub,
//       exp,
//     } = claims;

//     const item = {
//       body: {
//         ...body,
//         decodedToken: {
//           claims,
//           user: {
//             nickname,
//             name,
//             picture,
//             updated_at,
//             email,
//             email_verified,
//             sub,
//           },
//           audience,
//           client_id,
//         },
//       },
//       expiresAt: exp,
//     };

//     window.localStorage.setItem("auth0Cypress", JSON.stringify(item));

//     cy.visit("/");
//   });
// });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
    }
  }
}
