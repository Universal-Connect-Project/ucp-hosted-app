import { Keys } from "@/resources/clients/clientsModel";
import { PORT } from "@/shared/consts";

const USER_ID: string = "auth0|667c3d0c90b963e3671f411e";

describe("Client API", () => {
  let accessToken: string;
  let accessTokenBasic: string;
  let newClientId: string;
  let newClientSecret: string;

  const getTokens = () => {
    cy.window()
      .its("localStorage")
      .invoke("getItem", "jwt-client")
      .then((token: string) => {
        if (token) {
          accessToken = token;
        }
      });
    cy.window()
      .its("localStorage")
      .invoke("getItem", "jwt-client-basic")
      .then((token: string) => {
        if (token) {
          accessTokenBasic = token;
        }
      });
  };

  before(() => {
    getTokens();
    if (!accessToken) {
      cy.loginClientAuth0();
      cy.loginClientAuth0(false);
    }
    getTokens();
  });

  it("fails with unauthorized if there is no access token", () => {
    cy.request({
      failOnStatusCode: false,
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients/keys`,
      headers: {
        ContentType: "application/json",
      },
    }).then((response: Cypress.Response<{ body: Keys }>) => {
      expect(response.status).to.eq(401);
      expect(response.body).property("message").to.eq("Unauthorized");
    });
  });

  it("clears the client_id from user metadata, tries creating a client without access token, creates a client, fails if another client request is made, gets the newly created client, and deletes the client", () => {
    cy.request({
      failOnStatusCode: false,
      method: "DELETE",
      url: `http://localhost:${PORT}/v1/clients/keys`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    cy.request({
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients/keys`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response: Cypress.Response<{ body: Keys }>) => {
      const { body } = response;
      newClientId = (body as unknown as Keys).clientId;
      newClientSecret = (response.body as unknown as Keys).clientSecret;

      expect(response.status).to.eq(200);
      expect(Object.keys(body)).to.have.length(2);
      expect(Object.keys(body)).to.include("clientId");
      expect(Object.keys(body)).to.include("clientSecret");
    });

    cy.request({
      method: "GET",
      url: `http://localhost:${PORT}/v1/clients/keys`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      const { body } = response;

      expect(response.status).to.eq(200);
      expect(Object.keys(body)).to.have.length(2);
      expect(Object.keys(body)).to.include("clientId");
      expect(Object.keys(body)).to.include("clientSecret");
      expect(body).property("clientId").to.deep.eq(newClientId);
    });

    cy.request({
      failOnStatusCode: false,
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients/keys`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        userId: USER_ID,
      },
    }).then((response: Cypress.Response<never>) => {
      expect(response.status).to.eq(400);
      expect(response.body).property("message").to.eq("User already has keys");
    });

    cy.request({
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients/keys/rotate`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response: Cypress.Response<{ body: Keys }>) => {
      expect((response.body as unknown as Keys).clientSecret).not.to.eq(
        newClientSecret,
      );
    });

    cy.request({
      method: "DELETE",
      url: `http://localhost:${PORT}/v1/clients/keys`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.request({
      failOnStatusCode: false,
      method: "GET",
      url: `http://localhost:${PORT}/v1/clients/keys`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(404);
      expect(response.body).property("message").to.eq("Keys not found");
    });

    cy.request({
      failOnStatusCode: false,
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients/keys/rotate`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(404);
      expect(response.body).property("message").to.eq("Keys not found");
    });
  });

  it("tries CREATING a client with a token that does not have the proper permissions", () => {
    cy.request({
      failOnStatusCode: false,
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients/keys`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessTokenBasic}`,
      },
    }).then((response: Cypress.Response<{ body: Keys }>) => {
      expect(response.status).to.eq(403);
    });
  });

  it("tries GETTING a client with a token that does not have the proper permissions", () => {
    cy.request({
      failOnStatusCode: false,
      method: "GET",
      url: `http://localhost:${PORT}/v1/clients/keys`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessTokenBasic}`,
      },
    }).then((response: Cypress.Response<{ body: Keys }>) => {
      expect(response.status).to.eq(403);
    });
  });

  it("tries DELETING a client with a token that does not have the proper permissions", () => {
    cy.request({
      failOnStatusCode: false,
      method: "DELETE",
      url: `http://localhost:${PORT}/v1/clients/keys`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessTokenBasic}`,
      },
    }).then((response: Cypress.Response<{ body: Keys }>) => {
      expect(response.status).to.eq(403);
    });
  });

  it("tries ROTATING a client with a token that does not have the proper permissions", () => {
    cy.request({
      failOnStatusCode: false,
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients/keys/rotate`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessTokenBasic}`,
      },
    }).then((response: Cypress.Response<{ body: Keys }>) => {
      expect(response.status).to.eq(403);
    });
  });
});
