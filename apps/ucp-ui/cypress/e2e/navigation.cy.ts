describe("Health", () => {
  it("renders something on the page", () => {
    cy.visit("http://localhost:8080");

    cy.findByText("Hello world!").should("exist");
  });

  it("renders a not found page", () => {
    cy.visit("http://localhost:8080/ninjas");

    cy.findByText("Not found").should("exist");
  });

  it("logs you out", () => {});
});
