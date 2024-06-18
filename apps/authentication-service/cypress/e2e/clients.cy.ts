import { Client } from "auth0";

describe("Client API", () => {
  const PORT: number = (Cypress.env("PORT") as number) || 8089;
  let accessToken: string;
  let newClientId: string;

  const getToken = () => {
    cy.window()
      .its("localStorage")
      .invoke("getItem", "jwt")
      .then((token) => {
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

  it("creates new client", () => {
    const clientName = "__Test Client__";

    cy.request({
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        name: clientName,
        description: "--DELETE ME--",
      },
    }).then((response: Cypress.Response<{ body: Client }>) => {
      newClientId = (response.body as unknown as Client).client_id;
      expect(response.status).to.eq(200);
      expect(response.body).property("name").to.eq(clientName);
    });
  });

  it("returns client info", () => {
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

  it("deletes client", () => {
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
