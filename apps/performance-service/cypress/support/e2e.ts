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
import { AUTH0_WIDGET_AUDIENCE } from "@repo/shared-utils";
import { JwtPayload } from "jsonwebtoken";
import { WIDGET_ACCESS_TOKEN } from "../shared/constants/accessTokens";
import "./commands";

const authenticateAndStoreToken = ({
  audience,
  variableName,
  clientParams,
}: {
  audience: string;
  variableName: string;
  clientParams?: {
    clientIdString: string;
    clientSecretString: string;
  };
}) => {
  const { clientIdString, clientSecretString } = clientParams;
  const requestBody = {
    grant_type: "client_credentials",
    audience,
    client_id: Cypress.env(clientIdString) as string,
    client_secret: Cypress.env(clientSecretString) as string,
  };

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
});
