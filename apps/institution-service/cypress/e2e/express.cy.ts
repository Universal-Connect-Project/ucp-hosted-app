const testLimit: number = 30;

describe("Express", () => {
  const PORT: number = (Cypress.env("PORT") as number) || 8089;

  it("returns pong", () => {
    cy.request(`http://localhost:${PORT}/ping`).then(
      (response: Cypress.Response<{ message: string }>) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.eq("Greetings.");
      },
    );
  });
});
