import { Client } from "auth0";

const USER_ID = "google-oauth2|115545703201865461059";

describe("Client API", () => {
  const PORT: number = (Cypress.env("PORT") as number) || 8089;
  let accessToken: string;
  let newClientId: string;

  const getToken = () => {
    cy.window()
      .its("localStorage")
      .invoke("getItem", "jwt")
      .then((token: string) => {
        if (token) {
          accessToken = token;
        }
      });
  };

  before(() => {
    getToken();
    if (!accessToken) {
      cy.loginByAuth0Api();
      cy.wait(1500);
      getToken();
    }
  });

  it("deletes the client_id from user metadata", () => {
    cy.request({
      method: "PATCH",
      url: `https://${Cypress.env("AUTH0_DOMAIN")}/api/v2/users/${USER_ID}`,
      body: {
        user_metadata: {
          client_id: "",
        },
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  });

  it("creates a new client with incorrect parameters", () => {
    cy.request({
      failOnStatusCode: false,
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        clientId: "",
      },
    }).then((response: Cypress.Response<{ body: Client }>) => {
      expect(response.status).to.eq(422);
      expect(response.body)
        .property("errors")
        .property("message")
        .to.eq("userId is a required field");
    });
  });

  it("creates a new client", () => {
    cy.request({
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        userId: USER_ID,
      },
    }).then((response: Cypress.Response<{ body: Client }>) => {
      newClientId = (response.body as unknown as Client).client_id;
      expect(response.status).to.eq(200);
    });
  });

  it("returns new client info", () => {
    cy.wait(1500);
    cy.request({
      method: "GET",
      url: `http://localhost:${PORT}/v1/clients/${newClientId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(200);
      expect(response.body).property("client_id").to.eq(newClientId);
    });
  });

  it("tries creating a new client for user that already has one", () => {
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
      expect(response.body).to.property("message", "User already has a client");
    });
  });

  it("deletes the new client", () => {
    cy.request({
      method: "DELETE",
      url: `http://localhost:${PORT}/v1/clients/${newClientId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
