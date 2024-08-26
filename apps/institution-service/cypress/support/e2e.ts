/// <reference types="cypress" />
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
import {
  DefaultPermissions,
  UiClientPermissions,
} from "../../src/shared/enums";

before(() => {
  const widgetAudience = Cypress.env("AUTH0_WIDGET_AUDIENCE") as string;
  const clientAudience = "ucp-hosted-apps";

  const username = Cypress.env("E2E_INSTITUTION_USERNAME") as string;
  const password = Cypress.env("E2E_INSTITUTION_PASSWORD") as string;

  const ucpWebUiClientId = Cypress.env("WEB_UI_CLIENT_ID") as string;
  const ucpWebUiClientSecret = Cypress.env("WEB_UI_CLIENT_SECRET") as string;

  const client_id = Cypress.env("WIDGET_CLIENT_ID") as string;
  const client_secret = Cypress.env("WIDGET_CLIENT_SECRET") as string;

  const scope = `${Object.values(DefaultPermissions).join(" ")} ${Object.values(UiClientPermissions).join(" ")}`;

  cy.request({
    method: "POST",
    url: `https://${Cypress.env("AUTH0_DOMAIN")}/oauth/token`,
    body: {
      audience: clientAudience,
      client_id: ucpWebUiClientId,
      grant_type: "password",
      password,
      scope,
      username,
    },
  }).then((response: Cypress.Response<JwtPayload>) => {
    Cypress.env("USER_ACCESS_TOKEN", response.body.access_token);
  });

  cy.request({
    method: "POST",
    url: `https://${Cypress.env("AUTH0_DOMAIN")}/oauth/token`,
    body: {
      grant_type: "client_credentials",
      audience: widgetAudience,
      client_id,
      client_secret,
    },
  }).then((response: Cypress.Response<JwtPayload>) => {
    Cypress.env("ACCESS_TOKEN", response.body.access_token);
  });

  cy.request({
    method: "POST",
    url: `https://${Cypress.env("AUTH0_DOMAIN")}/oauth/token`,
    body: {
      grant_type: "password",
      scope: "openid offline_access profile email",
      username,
      password,
      audience: widgetAudience,
      client_id: ucpWebUiClientId,
      client_secret: ucpWebUiClientSecret,
    },
  }).then((response: Cypress.Response<JwtPayload>) => {
    Cypress.env("NO_KEYS_USER_ACCESS_TOKEN", response.body.access_token);
  });
});
