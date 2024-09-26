import { PORT } from "shared/const";

describe("Rate Limiting", () => {
  it("tests the default rate limiting middleware by sending 101 requests in less than a minute", () => {
    for (let i = 0; i < 100; i++) {
      cy.request({
        url: `http://localhost:${PORT}/ping`,
      })
        .its("status")
        .should("eq", 200);
    }

    for (let i = 0; i < 5; i++) {
      cy.request({
        url: `http://localhost:${PORT}/ping`,
      })
        .its("status")
        .should("eq", 429);
    }
  });
});
