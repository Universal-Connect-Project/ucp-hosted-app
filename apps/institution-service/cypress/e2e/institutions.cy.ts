import { JwtPayload } from "jsonwebtoken";
import { PORT } from "../../src/shared/const";
import { CachedInstitution } from "../../src/tasks/loadInstitutionsFromJson";
import { AUTH0_WIDGET_AUDIENCE } from "@repo/shared-utils";

const keysUrl = `http://localhost:8089/v1/clients/keys`;

type Keys = {
  clientId: string;
  clientSecret: string;
};

describe("Institution endpoints", () => {
  describe("/institutions/cacheList", () => {
    it("creates new client with user token, generates access token to access institution endpoints, gets institution cache list, and deletes the client", () => {
      cy.request({
        failOnStatusCode: false,
        method: "DELETE",
        url: keysUrl,
        headers: {
          Authorization: `Bearer ${Cypress.env("USER_ACCESS_TOKEN")}`,
        },
      });

      cy.request({
        method: "POST",
        url: keysUrl,
        headers: {
          ContentType: "application/json",
          Authorization: `Bearer ${Cypress.env("USER_ACCESS_TOKEN")}`,
        },
      }).then((response: Cypress.Response<Keys>) => {
        const client = response.body;

        cy.request({
          method: "POST",
          url: `https://${Cypress.env("AUTH0_DOMAIN")}/oauth/token`,
          body: {
            grant_type: "client_credentials",
            audience: AUTH0_WIDGET_AUDIENCE as string,
            client_id: client.clientId,
            client_secret: client.clientSecret,
          },
        }).then((response: Cypress.Response<JwtPayload>) => {
          const token = response.body.access_token as string;

          cy.request({
            url: `http://localhost:${PORT}/institutions/cacheList`,
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response: Cypress.Response<CachedInstitution[]>) => {
              const institution = response.body[1];
              const provider =
                institution.mx ??
                institution.sophtron ??
                institution.finicity ??
                {};

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
            })
            .then(() => {
              cy.request({
                method: "DELETE",
                url: keysUrl,
                headers: {
                  Authorization: `Bearer ${Cypress.env("USER_ACCESS_TOKEN")}`,
                },
              }).then((response) => {
                expect(response.status).to.eq(200);
              });
            });
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
          Authorization: `Bearer ${Cypress.env("NO_WIDGET_PERMISSION_ACCESS_TOKEN")}`,
        },
      }).then((response: Cypress.Response<{ message: string }>) => {
        expect(response.status).to.eq(403);
      });
    });
  });
});
