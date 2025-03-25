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
  USER_ACCESS_TOKEN_ENV,
  WIDGET_ACCESS_TOKEN,
} from "../shared/constants/accessTokens";
import "./commands";

const authenticateAndStoreToken = ({
  audience,
  passwordEnvString,
  usernameEnvString,
  variableName,
  clientParams,
}: {
  audience: string;
  passwordEnvString?: string;
  usernameEnvString?: string;
  variableName: string;
  clientParams?: {
    clientIdString: string;
    clientSecretString: string;
  };
}) => {
  let requestBody = {};
  if (clientParams) {
    const { clientIdString, clientSecretString } = clientParams;
    requestBody = {
      grant_type: "client_credentials",
      audience,
      client_id: Cypress.env(clientIdString) as string,
      client_secret: Cypress.env(clientSecretString) as string,
    };
  } else {
    requestBody = {
      audience,
      client_id: Cypress.env("WEB_UI_CLIENT_ID") as string,
      grant_type: "password",
      password: Cypress.env(passwordEnvString) as string,
      username: Cypress.env(usernameEnvString) as string,
      scope: [DefaultPermissions, UiClientPermissions, UiUserPermissions]
        .map((permissions) => Object.values(permissions))
        .reduce((acc, permissions) => [...acc, ...permissions], [])
        .join(" "),
    };
  }

  cy.request({
    method: "POST",
    url: `https://${Cypress.env("AUTH0_DOMAIN")}/oauth/token`,
    body: requestBody,
  }).then((response: Cypress.Response<JwtPayload>) => {
    Cypress.env(variableName, response.body.access_token);
  });
};

before(() => {
  authenticateAndStoreToken({
    audience: AUTH0_WIDGET_AUDIENCE,
    variableName: WIDGET_ACCESS_TOKEN,
    clientParams: {
      clientIdString: "WIDGET_CLIENT_ID",
      clientSecretString: "WIDGET_CLIENT_SECRET",
    },
  });

  authenticateAndStoreToken({
    audience: AUTH0_CLIENT_AUDIENCE,
    variableName: USER_ACCESS_TOKEN_ENV,
    passwordEnvString: "E2E_INSTITUTION_PASSWORD",
    usernameEnvString: "E2E_INSTITUTION_USERNAME",
  });
});
