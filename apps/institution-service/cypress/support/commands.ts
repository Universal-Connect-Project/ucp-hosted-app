/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";
import { JwtPayload } from "jsonwebtoken";

type ClientKeys = { clientId: string; clientSecret: string };

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
          client_secret: clientSecret,
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
      win["localStorage"].setItem(
        storageKey,
        response.body.access_token as string,
      ),
    );
  });
};

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
      loginWidgetHost(clientKeys: ClientKeys): string;
    }
  }
}
