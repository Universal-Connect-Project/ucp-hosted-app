// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import { JwtPayload } from "jsonwebtoken";
import "./commands";

before(() => {
  const client_id = Cypress.env("WIDGET_CLIENT_ID") as string;
  const client_secret = Cypress.env("WIDGET_CLIENT_SECRET") as string;
  const audience = Cypress.env("AUTH0_WIDGET_AUDIENCE") as string;

  cy.request({
    method: "POST",
    url: `https://${Cypress.env("AUTH0_DOMAIN")}/oauth/token`,
    body: {
      grant_type: "client_credentials",
      audience,
      client_id,
      client_secret,
    },
  }).then((response: Cypress.Response<JwtPayload>) => {
    Cypress.env("ACCESS_TOKEN", response.body.access_token);
  });

  const username = Cypress.env("E2E_USERNAME") as string;
  const password = Cypress.env("E2E_PASSWORD") as string;
  const ucpWebUiClientId = Cypress.env("WEB_UI_CLIENT_ID") as string;
  const ucpWebUiClientSecret = Cypress.env("WEB_UI_CLIENT_SECRET") as string;

  cy.request({
    method: "POST",
    url: `https://${Cypress.env("AUTH0_DOMAIN")}/oauth/token`,
    body: {
      grant_type: "password",
      scope: "openid offline_access profile email",
      username,
      password,
      audience: audience,
      client_id: ucpWebUiClientId,
      client_secret: ucpWebUiClientSecret,
    },
  }).then((response: Cypress.Response<JwtPayload>) => {
    Cypress.env("USER_ACCESS_TOKEN", response.body.access_token);
  });
});
