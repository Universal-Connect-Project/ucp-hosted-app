import { Client } from "auth0";

describe("Client API", () => {
  const PORT: number = (Cypress.env("PORT") as number) || 8089;
  let ACCESS_TOKEN: string;

  beforeEach(function () {
    cy.loginByAuth0Api();
    cy.window()
      .its("localStorage")
      .invoke("getItem", "jwt")
      .then((token) => {
        ACCESS_TOKEN = token;
      });
  });

  it("returns client info", () => {
    const clientId: string = Cypress.env("AUTH0_CLIENT_ID") as string;

    cy.request({
      method: "GET",
      url: `http://localhost:${PORT}/v1/clients/${clientId}`,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(200);
      expect(response.body).property("client_id").to.eq(clientId);
    });
  });

  it("creates new client", () => {
    // let newClientId: string;
    const clientName = "__Test Client__";

    cy.request({
      method: "POST",
      url: `http://localhost:${PORT}/v1/clients`,
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: {
        name: clientName,
        description: "--DELETE ME--",
      },
    }).then((response: Cypress.Response<{ body: Client }>) => {
      // newClientId = (response.body as unknown as Client).client_id;
      expect(response.status).to.eq(200);
      expect(response.body).property("name").to.eq(clientName);
    });
    // .then(() => {
    //   cy.wait(5000);
    //   cy.request({
    //     method: "DELETE",
    //     url: `https://${Cypress.env("AUTH0_DOMAIN")}/v1/clients/${newClientId}`,
    //     headers: {
    //       Authorization: `Bearer ${ACCESS_TOKEN}`,
    //     },
    //   });
    // });
  });
});
