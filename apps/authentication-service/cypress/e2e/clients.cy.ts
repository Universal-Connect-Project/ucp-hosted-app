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
});
