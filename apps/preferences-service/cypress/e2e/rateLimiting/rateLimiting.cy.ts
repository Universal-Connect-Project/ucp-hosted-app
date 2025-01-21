import { PORT } from "../../../src/shared/consts/port";

describe("Rate Limiting", () => {
  it("tests the default rate limiting middleware by sending 101 requests in less than a minute", () => {
    let successfullResponseCount = 0;
    let limitedResponseCount = 0;

    Cypress._.times(110, (_i) => {
      cy.request({
        url: `http://localhost:${PORT}/ping`,
        failOnStatusCode: false,
      }).then((response) => {
        cy.log("successCount", successfullResponseCount);
        cy.log("failCount", limitedResponseCount);
        if (response.status === 200) {
          successfullResponseCount += 1;
        } else if (response.status === 429) {
          limitedResponseCount += 1;
        }
      });
    });

    cy.wrap(null).then(() => {
      // I'm a little lenient on the exact number because the pipeline hits /ping as a check to see if it's
      // ready to test. So this way I can get it to pass locally and in the pipeline and still proove that
      // rate limiting is working
      expect(successfullResponseCount).to.be.greaterThan(95);
      expect(limitedResponseCount).to.be.greaterThan(9);
    });
  });
});
