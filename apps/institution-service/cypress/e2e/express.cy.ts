import { PORT } from "./../../shared/const";

describe("Express", () => {
  it("returns pong", () => {
    cy.request(`http://localhost:${PORT}/ping`).then(
      (response: Cypress.Response<{ message: string }>) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.eq("Greetings.");
      },
    );
  });
});
