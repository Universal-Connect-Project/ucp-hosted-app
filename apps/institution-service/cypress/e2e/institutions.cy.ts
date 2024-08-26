import { PORT } from "../../src/shared/const";
import { CachedInstitution } from "../../src/tasks/loadInstitutionsFromJson";

const keysUrl = `http://localhost:8089/v1/clients/keys`;

type Keys = {
  clientId: string;
  clientSecret: string;
};

const getLocalStorage = (args: {
  storageKey: string;
  callback: (token: string) => void;
}) => {
  const { storageKey, callback } = args;

  cy.window()
    .its("localStorage")
    .invoke("getItem", storageKey)
    .then((token: string) => {
      if (token) {
        callback(token);
      }
    });
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

        cy.loginWidgetHost({
          clientId: client.clientId,
          clientSecret: client.clientSecret,
        });

        cy.log(`TOKEN: ${Cypress.env("WIDGET_ACCESS_TOKEN")}`);
        getLocalStorage({
          storageKey: "jwt-widget-m2m",
          callback: (token: string) => {
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
                cy.log("institution", institution);

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
          },
        });

        // cy.request({
        //   url: `http://localhost:8088/institutions/cacheList`,
        //   method: "GET",
        //   headers: {
        //     Authorization: `Bearer ${Cypress.env("WIDGET_ACCESS_TOKEN")}`,
        //   },
        // })
        //   .then((response: Cypress.Response<{ message: string }>) => {
        //     expect(response.status).to.eq(200);
        //     expect(response.body).length.above(1);
        //   })
        //   .then(() => {
        //     cy.request({
        //       method: "DELETE",
        //       url: keysUrl,
        //       headers: {
        //         Authorization: `Bearer ${Cypress.env("USER_ACCESS_TOKEN")}`,
        //       },
        //     }).then((response) => {
        //       expect(response.status).to.eq(200);
        //     });
        //   });
      });
    });

    // it("gets 200 with valid token and has expected attributes", () => {
    //   cy.request({
    //     url: `http://localhost:${PORT}/institutions/cacheList`,
    //     method: "GET",
    //     headers: {
    //       Authorization: `Bearer ${Cypress.env("ACCESS_TOKEN")}`,
    //     },
    //   }).then((response: Cypress.Response<CachedInstitution[]>) => {
    //     const institution = response.body[1];
    //     const provider =
    //       institution.mx ?? institution.sophtron ?? institution.finicity;
    //
    //     expect(response.status).to.eq(200);
    //
    //     // Institution Attributes
    //     [
    //       "name",
    //       "keywords",
    //       "logo",
    //       "url",
    //       "ucp_id",
    //       "is_test_bank",
    //       "routing_numbers",
    //     ].forEach((attribute) => {
    //       expect(institution).to.haveOwnProperty(attribute);
    //     });
    //
    //     // Provider Attributes
    //     [
    //       "id",
    //       "supports_oauth",
    //       "supports_identification",
    //       "supports_aggregation",
    //       "supports_history",
    //     ].forEach((attribute) => {
    //       expect(provider).to.haveOwnProperty(attribute);
    //     });
    //   });
    // });

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
          Authorization: `Bearer ${Cypress.env("NO_KEYS_USER_ACCESS_TOKEN")}`,
        },
      }).then((response: Cypress.Response<{ message: string }>) => {
        expect(response.status).to.eq(403);
      });
    });
  });
});
