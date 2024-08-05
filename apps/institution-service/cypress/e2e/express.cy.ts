const testLimit: number = 30;

describe("Express", () => {
  it("returns pong", () => {
    cy.request(`http://localhost:8088/ping`).then(
      (response: Cypress.Response<{ message: string }>) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.eq("Greetings.");
      },
    );
  });
});
