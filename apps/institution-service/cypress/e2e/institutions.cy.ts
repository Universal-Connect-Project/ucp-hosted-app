import { PORT } from "../../src/shared/const";
import { CachedInstitution } from "../../src/tasks/loadInstitutionsFromJson";

describe("Institution endpoints", () => {
  describe("/institutions/cacheList", () => {
    it("gets 200 with valid token and has expected attributes", () => {
      cy.request({
        url: `http://localhost:${PORT}/institutions/cacheList`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${Cypress.env("ACCESS_TOKEN")}`,
        },
      }).then((response: Cypress.Response<CachedInstitution[]>) => {
        const institution = response.body[1];
        const provider =
          institution.mx ?? institution.sophtron ?? institution.finicity;

        expect(response.status).to.eq(200);

        // Institution Attributes
        [
          "name",
          "keywords",
          "logo",
          "url",
          "ucp_id",
          "is_test_bank",
          "routing_numbers",
        ].forEach((attribute) => {
          expect(institution).to.haveOwnProperty(attribute);
        });

        // Provider Attributes
        [
          "id",
          "supports_oauth",
          "supports_identification",
          "supports_aggregation",
          "supports_history",
        ].forEach((attribute) => {
          expect(provider).to.haveOwnProperty(attribute);
        });
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
