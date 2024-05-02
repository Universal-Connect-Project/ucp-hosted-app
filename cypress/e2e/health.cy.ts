describe("Health", () => {
  it("renders something on the page", () => {
    cy.visit("http://localhost:8080");

    cy.findByText("Hello world!").should("exist");
  });
});
