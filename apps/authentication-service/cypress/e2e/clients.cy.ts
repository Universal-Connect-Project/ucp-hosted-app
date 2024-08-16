import { Keys } from "@/resources/clients/clientsModel";
import { PORT } from "@/shared/consts";

const USER_ID: string = "auth0|667c3d0c90b963e3671f411e";

describe("Client API", () => {
  let accessToken: string;
  let accessTokenBasic: string;
  let newClientId: string;
  let newClientSecret: string;

  const keysUrl = `http://localhost:${PORT}/v1/clients/keys`;
  // const auth0BaseUrl = Cypress.env("AUTH0_DOMAIN") as string;
  // const auth0ClientGrantsUrl = `${auth0BaseUrl}api/v2/client-grants`;

  const getTokens = () => {
    cy.window()
      .its("localStorage")
      .invoke("getItem", "jwt-with-key-roles")
      .then((token: string) => {
        if (token) {
          accessToken = token;
        }
      });
    cy.window()
      .its("localStorage")
      .invoke("getItem", "jwt-without-key-roles")
      .then((token: string) => {
        if (token) {
          accessTokenBasic = token;
        }
      });
  };

  before(() => {
    getTokens();
    if (!accessToken) {
      cy.loginWithKeyRoles();
      cy.loginWithoutKeyRoles();
    }
    getTokens();
  });

  it("fails with unauthorized if there is no access token", () => {
    cy.request({
      failOnStatusCode: false,
      method: "POST",
      url: keysUrl,
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
    }).then((response: Cypress.Response<{ body: Keys }>) => {
      const { body } = response;
      newClientId = (body as unknown as Keys).clientId;
      newClientSecret = (response.body as unknown as Keys).clientSecret;

      expect(response.status).to.eq(200);
      expect(Object.keys(body)).to.have.length(2);
      expect(Object.keys(body)).to.include("clientId");
      expect(Object.keys(body)).to.include("clientSecret");
    });

    // Do we need this? We would need to hit Auth0's api to
    // confirm proper grant was created
    // cy.request({
    //   method: "POST",
    //   url: auth0ClientGrantsUrl,
    //   headers: {
    //     ContentType: "application/json",
    //     Authorization: `Bearer ${accessToken}`,
    //   },
    // }).then((response: Cypress.Response<{ body: Keys }>) => {
    //   const { body } = response;
    //
    //   expect(response.status).to.eq(200);
    //   expect(Object.keys(body)).to.have.length(4);
    //   expect(Object.keys(body)).to.include("id");
    //   expect(Object.keys(body)).to.include("client_id");
    //   expect(Object.keys(body)).to.include("audience");
    //   expect(Object.keys(body)).to.include("scope");

    // });

    cy.request({
      method: "GET",
      url: keysUrl,
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
      url: keysUrl,
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

    cy.wait(2000); // Because sometimes we hit the shortened rate limit

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
      url: keysUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.request({
      failOnStatusCode: false,
      method: "GET",
      url: keysUrl,
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

  it("responds with a 403 when CREATING api keys without the proper permissions", () => {
    cy.request({
      failOnStatusCode: false,
      method: "POST",
      url: keysUrl,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessTokenBasic}`,
      },
    }).then((response: Cypress.Response<{ body: Keys }>) => {
      expect(response.status).to.eq(403);
    });
  });

  it("responds with a 403 when GETTING api keys without the proper permissions", () => {
    cy.request({
      failOnStatusCode: false,
      method: "GET",
      url: keysUrl,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessTokenBasic}`,
      },
    }).then((response: Cypress.Response<{ body: Keys }>) => {
      expect(response.status).to.eq(403);
    });
  });

  it("responds with a 403 when DELETING api keys without the proper permissions", () => {
    cy.request({
      failOnStatusCode: false,
      method: "DELETE",
      url: keysUrl,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessTokenBasic}`,
      },
    }).then((response: Cypress.Response<{ body: Keys }>) => {
      expect(response.status).to.eq(403);
    });
  });

  it("responds with a 403 when ROTATING api keys without the proper permissions", () => {
    cy.request({
      failOnStatusCode: false,
      method: "POST",
      url: `${keysUrl}/rotate`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessTokenBasic}`,
      },
    }).then((response: Cypress.Response<{ body: Keys }>) => {
      expect(response.status).to.eq(403);
    });
  });
});
