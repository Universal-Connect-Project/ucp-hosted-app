describe("Demo", () => {
  it("navigates to the demo page", () => {
    cy.loginWithWidgetDemoPermissions();
    cy.visit("/");
    cy.findByText("Demo").click();

    cy.get("iframe")
      .its("0.contentDocument")
      .its("body")
      .within(() => {
        cy.findByText("Select your institution").should("exist");
      });
  });
});
