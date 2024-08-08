import { PORT } from "../../shared/const";

describe("Express", () => {
  it("returns pong", () => {
    cy.request(`http://localhost:${PORT}/ping`).then(
      (response: Cypress.Response<{ message: string }>) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.eq("Greetings.");
      }
    );
  });

  it("gets 200 from /institutions/cacheList", () => {
    cy.request({
      url: `http://localhost:${PORT}/institutions/cacheList`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${Cypress.env("ACCESS_TOKEN")}`,
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(200);
      expect(response.body).length.above(1);
    });
  });

  it("gets 401 from /institutions/cacheList when token is invalid", () => {
    cy.request({
      url: `http://localhost:${PORT}/institutions/cacheList`,
      failOnStatusCode: false,
      method: "GET",
      headers: {
        Authorization: "Bearer junk",
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(401);
    });
  });
});
