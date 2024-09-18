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
import {
  AUTH0_CLIENT_AUDIENCE,
  AUTH0_WIDGET_AUDIENCE,
  DefaultPermissions,
  UiClientPermissions,
  UiUserPermissions,
} from "@repo/shared-utils";
import { JwtPayload } from "jsonwebtoken";
import {
  AGGREGATOR_USER_ACCESS_TOKEN_ENV,
  NO_WIDGET_PERMISSION_ACCESS_TOKEN_ENV,
  SUPER_USER_ACCESS_TOKEN_ENV,
  USER_ACCESS_TOKEN_ENV,
} from "../shared/constants/accessTokens";
import "./commands";

const authenticateAndStoreToken = ({
  audience,
  passwordEnvString,
  usernameEnvString,
  variableName,
}: {
  audience: string;
  passwordEnvString: string;
  usernameEnvString: string;
  variableName: string;
}) => {
  const ucpWebUiClientId = Cypress.env("WEB_UI_CLIENT_ID") as string;

  const allPermissionsScope = [
    DefaultPermissions,
    UiClientPermissions,
    UiUserPermissions,
  ]
    .map((permissions) => Object.values(permissions))
    .reduce((acc, permissions) => [...acc, ...permissions], [])
    .join(" ");

  cy.request({
    method: "POST",
    url: `https://${Cypress.env("AUTH0_DOMAIN")}/oauth/token`,
    body: {
      audience,
      client_id: ucpWebUiClientId,
      grant_type: "password",
      password: Cypress.env(passwordEnvString) as string,
      username: Cypress.env(usernameEnvString) as string,
      scope: allPermissionsScope,
    },
  }).then((response: Cypress.Response<JwtPayload>) => {
    Cypress.env(variableName, response.body.access_token);
  });
};

before(() => {
  authenticateAndStoreToken({
    audience: AUTH0_CLIENT_AUDIENCE,
    passwordEnvString: "E2E_INSTITUTION_PASSWORD",
    usernameEnvString: "E2E_INSTITUTION_USERNAME",
    variableName: USER_ACCESS_TOKEN_ENV,
  });

  authenticateAndStoreToken({
    audience: AUTH0_WIDGET_AUDIENCE,
    passwordEnvString: "E2E_INSTITUTION_PASSWORD",
    usernameEnvString: "E2E_INSTITUTION_USERNAME",
    variableName: NO_WIDGET_PERMISSION_ACCESS_TOKEN_ENV,
  });

  authenticateAndStoreToken({
    audience: AUTH0_CLIENT_AUDIENCE,
    passwordEnvString: "SUPER_ADMIN_PASSWORD",
    usernameEnvString: "SUPER_ADMIN_USERNAME",
    variableName: SUPER_USER_ACCESS_TOKEN_ENV,
  });

  authenticateAndStoreToken({
    audience: AUTH0_CLIENT_AUDIENCE,
    passwordEnvString: "AGGREGATOR_ADMIN_PASSWORD",
    usernameEnvString: "AGGREGATOR_ADMIN_USERNAME",
    variableName: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
  });
});
