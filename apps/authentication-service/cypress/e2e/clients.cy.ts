import { Keys } from "../../src/resources/clients/clientsModel";

const USER_ID: string = "auth0|667c3d0c90b963e3671f411e";

describe("Client API", () => {
  const PORT: number = (Cypress.env("PORT") as number) || 8089;
  let accessToken: string;
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
  };

  before(() => {
    getTokens();
    if (!accessToken) {
      cy.loginClientAuth0();
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
      expect(response.body)
        .property("message")
        .to.eq("Requires Authentication");
    });
  });

  it("clears the client_id from user metadata, tries creating a client without access token, creates a client, fails if another client request is made, gets the newly created client, and deletes the client", () => {
    // 0. Remove the client_id from the user??? Maybe?
    // 1. Delete the Client
    // 2. Create a new Client
    // 3. Get the client
    // 4. Try to create again, make sure error is returned
    // 5. Delete the Client
    // 6. Get the client, to make sure it's deleted

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
      expect(response.body)
        .property("message")
        .to.eq("User already has a client");
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
      expect(response.body).property("message").to.eq("Client not found");
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
      expect(response.body).property("message").to.eq("Client not found");
    });
  });
});
