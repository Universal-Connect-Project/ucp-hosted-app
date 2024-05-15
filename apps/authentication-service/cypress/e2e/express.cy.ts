describe("Express", () => {
  it("returns pong", () => {
    cy.request("http://localhost:8081/api/ping").then(
      (response: Cypress.Response<{ message: string }>) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.eq("pong");
      },
    );
  });

  it("handles not found", () => {
    cy.request({
      url: "http://localhost:8081/api/pig",
      failOnStatusCode: false,
    })
      .its("status")
      .should("eq", 404);
  });
});
