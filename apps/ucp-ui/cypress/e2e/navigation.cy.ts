describe("Health", () => {
  it("renders a not found page", () => {
    cy.loginWithWidgetRole();
    cy.visit("/ninjas");

    cy.findByText("Not found").should("exist");
  });

  it("logs you out", () => {
    cy.loginWithWidgetRole();
    cy.visit("/");

    cy.findByText("Log out").click();

    cy.url().should("not.equal", Cypress.config("baseUrl"));
  });
});
