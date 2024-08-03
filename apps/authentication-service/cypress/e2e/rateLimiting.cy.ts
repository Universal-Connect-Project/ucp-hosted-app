const testLimit: number = 30;

describe("Express", () => {
  const PORT: number = (Cypress.env("PORT") as number) || 8089;

  it("returns pong", () => {
    cy.request(`http://localhost:${PORT}/ping`).then(
      (response: Cypress.Response<{ message: string }>) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.eq("pong");
      },
    );
  });

  it("handles not found", () => {
    cy.request({
      url: `http://localhost:${PORT}/pig`,
      failOnStatusCode: false,
    })
      .its("status")
      .should("eq", 404);
  });

  it("tests the rate limiting middleware by sending 35 requests, 30 succeeding, and 5 failing", () => {
    // Wait for the rate limiter windowMs to reset
    cy.wait(2000);

    for (let i = 0; i < testLimit - 5; i++) {
      if (i < testLimit) {
        cy.request({
          url: `http://localhost:${PORT}/ping`,
        })
          .its("status")
          .should("eq", 200);
      } else {
        cy.request({
          url: `http://localhost:${PORT}/ping`,
          failOnStatusCode: false,
        })
          .its("status")
          .should("eq", 429);
      }
    }
  });
});
