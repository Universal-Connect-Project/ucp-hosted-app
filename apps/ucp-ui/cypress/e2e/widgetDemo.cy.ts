/* eslint-disable @typescript-eslint/no-unsafe-member-access */

describe("Demo", () => {
  const getIframeBodyAndContent = (
    iframeSelector,
    elementInsideIframeSelector,
    totalTimeout = 20000,
  ) => {
    return cy
      .get(iframeSelector, { timeout: totalTimeout / 2 })
      .should("exist")
      .then(($iframe) => {
        return new Cypress.Promise((resolve) => {
          if (
            $iframe[0].contentDocument &&
            $iframe[0].contentDocument.readyState === "complete"
          ) {
            const iframeBody = Cypress.$($iframe[0].contentDocument.body);
            if (iframeBody.length && Cypress.dom.isAttached(iframeBody)) {
              return resolve(iframeBody);
            }
          }

          $iframe.on("load", () => {
            const iframeBody = Cypress.$($iframe[0].contentDocument.body);
            if (iframeBody.length && Cypress.dom.isAttached(iframeBody)) {
              resolve(iframeBody);
            } else {
              Cypress.log({
                name: "iframeLoadWarning",
                message:
                  "Iframe body not attached immediately after load event. This might indicate rapid re-rendering.",
              });
              cy.wrap(iframeBody, { timeout: totalTimeout / 4 })
                .should(($b) => {
                  if (!$b.length || !Cypress.dom.isAttached($b)) {
                    throw new Error(
                      "Iframe body not attached after load, retrying...",
                    );
                  }
                })
                .then((resolvedBody) => resolve(resolvedBody));
            }
          });
        });
      })
      .then(($iframeBody) => {
        console.log("Iframe body loaded and attached:", $iframeBody);
        cy.wrap($iframeBody, { timeout: 0 })
          .find(elementInsideIframeSelector, { timeout: totalTimeout / 2 })
          .should("exist")
          .and("be.visible")
          .and("contain", "Select your institution");
      });
  };
  it("navigates to the demo page", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByText("Demo").click();

    cy.get("iframe")
      .should("have.attr", "src")
      .and("include", "widget?jobTypes=transactionHistory");

    getIframeBodyAndContent("iframe", "#connect-search-header", 10000); // Wait for the iframe body to be ready

    // cy.get("iframe")
    //   .its("0.contentDocument")
    //   .should("exist")
    //   .its("body")
    //   .should("not.be.undefined")
    //   .should(($body) => {
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    //     expect($body.html()).to.not.be.empty;
    //   })
    //   .find("#connect-search-header", { timeout: 10000 }) // Now find the specific element within the potentially dynamic body
    //   .should("exist") // Ensure the element exists
    //   .and("be.visible");
  });
});
