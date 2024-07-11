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

  // "creates a client, fails if another client request is made, gets the newly created client, and deletes the client"
  it("clears the client_id from user metadata, tries creating a client without access token, creates a client, fails if another client request is made, gets the newly created client, and deletes the client", () => {
    cy.request({
      method: "PATCH",
      url: `https://${Cypress.env("AUTH0_DOMAIN")}/api/v2/users/${USER_ID}`,
      body: {
        user_metadata: {
          client_id: "",
        },
      },
      headers: {
        Authorization: `Bearer ${m2mToken}`,
      },
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
      expect(response.status).to.eq(400);
      expect(response.body).to.property("body", "User already has a client");
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
  });
});
