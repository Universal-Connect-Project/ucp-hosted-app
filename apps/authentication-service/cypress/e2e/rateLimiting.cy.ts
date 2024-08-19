const testLimit: number = 10;

describe("Rate Limiting", () => {
  const PORT: number = 8089;

  it("tests the rate limiting middleware by sending 10 requests, 5 succeeding, and 5 failing", () => {
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
