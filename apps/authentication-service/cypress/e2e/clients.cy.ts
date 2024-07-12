import { Client } from "auth0";

const USER_ID: string = "auth0|667c3d0c90b963e3671f411e";

describe("Client API", () => {
  const PORT: number = (Cypress.env("PORT") as number) || 8089;
  let accessToken: string;
  let m2mToken: string;
  let newClientId: string;

  const getTokens = () => {
    cy.window()
      .its("localStorage")
      .invoke("getItem", "jwt-m2m")
      .then((token: string) => {
        if (token) {
          m2mToken = token;
        }
      });
    cy.window()
      .its("localStorage")
      .invoke("getItem", "jwt-client")
      .then((token: string) => {
        if (token) {
          accessToken = token;
        }
      });
  };

  before(() => {
    getTokens();
    if (!accessToken) {
      cy.loginM2MAuth0();
    }
    if (!m2mToken) {
      cy.loginClientAuth0();
    }
    getTokens();
  });

  it("creates a client without access token", () => {
    cy.request({
      failOnStatusCode: false,
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients`,
      headers: {
        ContentType: "application/json",
      },
    }).then((response: Cypress.Response<{ body: Client }>) => {
      expect(response.status).to.eq(401);
      expect(response.body)
        .property("message")
        .to.eq("Requires Authentication");
    });
  });

  it("clears the client_id from user metadata, tries creating a client without access token, creates a client, fails if another client request is made, gets the newly created client, and deletes the client", () => {
    // 1. Delete the Client
    // 2. Create a new Client
    // 3. Get the client
    // 4. Try to create again, make sure error is returned
    // 5. Delete the Client
    // 6. Get the client, to make sure it's deleted

    cy.request({
      failOnStatusCode: false,
      method: "DELETE",
      url: `http://localhost:${PORT}/v1/clients`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(500);
    });

    cy.request({
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response: Cypress.Response<{ body: Client }>) => {
      newClientId = (response.body as unknown as Client).client_id;
      expect(response.status).to.eq(200);
    });

    cy.request({
      method: "GET",
      url: `http://localhost:${PORT}/v1/clients`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(200);
      expect(response.body).property("client_id").to.eq(newClientId);
    });

    cy.request({
      failOnStatusCode: false,
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        userId: USER_ID,
      },
    }).then((response: Cypress.Response<never>) => {
      expect(response.status).to.eq(500);
      expect(response).to.property("body", "Unable to create client");
    });

    cy.request({
      method: "DELETE",
      url: `http://localhost:${PORT}/v1/clients`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.request({
      failOnStatusCode: false,
      method: "GET",
      url: `http://localhost:${PORT}/v1/clients`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(500);
      expect(response).to.property("body", "Unable to get client");
    });
  });
});
