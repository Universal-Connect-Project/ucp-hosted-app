import { PORT } from "../../shared/const";

describe("Institution endpoints", () => {
  describe("/institutions/cacheList", () => {
    it("gets 200 with valid token", () => {
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

    it("gets 401 when token is invalid", () => {
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

    it("gets 403 when token doesnt have permission", () => {
      cy.request({
        url: `http://localhost:${PORT}/institutions/cacheList`,
        failOnStatusCode: false,
        method: "GET",
        headers: {
          Authorization: `Bearer ${Cypress.env("USER_ACCESS_TOKEN")}`,
        },
      }).then((response: Cypress.Response<{ message: string }>) => {
        expect(response.status).to.eq(403);
      });
    });
  });
});
