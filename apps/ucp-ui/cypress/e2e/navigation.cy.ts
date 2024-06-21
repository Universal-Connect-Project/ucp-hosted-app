describe("Health", () => {
  it("renders something on the page", () => {
    cy.visit("/");

    cy.findByText("Hello world!").should("exist");
  });

  it("renders a not found page", () => {
    cy.visit("/ninjas");

    cy.findByText("Not found").should("exist");
  });

  it("logs you out", () => {
    cy.visit("/");

    cy.findByText("Log out").click();

    cy.url().should("not.equal", Cypress.config("baseUrl"));
  });
});
