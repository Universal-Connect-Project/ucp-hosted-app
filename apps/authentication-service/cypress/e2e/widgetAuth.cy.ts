import { Keys } from "../../src/resources/clients/clientsModel";
import { PORT } from "../../src/shared/consts";

describe("Client API", () => {
  let accessToken: string;

  const keysUrl = `http://localhost:${PORT}/v1/clients/keys`;

  const getLocalStorage = (args: {
    storageKey: string;
    callback: (token: string) => void;
  }) => {
    const { storageKey, callback } = args;

    cy.window()
      .its("localStorage")
      .invoke("getItem", storageKey)
      .then((token: string) => {
        if (token) {
          callback(token);
        }
      });
  };

  const getTokens = () => {
    getLocalStorage({
      storageKey: "jwt-with-key-roles",
      callback: (token: string) => {
        accessToken = token;
      },
    });
  };

  before(() => {
    getTokens();
    if (!accessToken) {
      cy.loginWithKeyRoles();
    }
    getTokens();
  });

  it("creates a new client, accesses institution cache endpoint, and deletes the client", () => {
    cy.request({
      failOnStatusCode: false,
      method: "DELETE",
      url: keysUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    cy.request({
      method: "POST",
      url: keysUrl,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response: Cypress.Response<Keys>) => {
      const client = response.body;

      cy.loginWidgetHost({
        clientId: client.clientId,
        clientSecret: client.clientSecret,
      });

      getLocalStorage({
        storageKey: "jwt-widget-m2m",
        callback: (token: string) => {
          cy.request({
            url: `http://localhost:8088/institutions/cacheList`,
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response: Cypress.Response<{ message: string }>) => {
              expect(response.status).to.eq(200);
              expect(response.body).length.above(1);
            })
            .then(() => {
              cy.request({
                method: "DELETE",
                url: keysUrl,
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }).then((response) => {
                expect(response.status).to.eq(200);
              });
            });
        },
      });
    });
  });
});
