describe("template spec", () => {
  it("passes", () => {
    cy.request("http://localhost:8055/ping");
  });
});
