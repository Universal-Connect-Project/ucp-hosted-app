import { AUTH0_WIDGET_AUDIENCE } from "@repo/shared-utils";
import { JwtPayload } from "jsonwebtoken";
import { PORT } from "../../src/shared/const";
import { CachedInstitution } from "../../src/tasks/loadInstitutionsFromJson";
import { testInstitution } from "../../src/test/testData/institutions";
import {
  runInvalidPermissionCheck,
  runTokenInvalidCheck,
} from "../support/utils";
import {
  SUPER_USER_ACCESS_TOKEN_ENV,
  USER_ACCESS_TOKEN_ENV,
} from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";

const keysUrl = `http://localhost:8089/v1/clients/keys`;

type Keys = {
  clientId: string;
  clientSecret: string;
};

const institutionAttributes = [
  "name",
  "keywords",
  "logo",
  "url",
  "ucp_id",
  "is_test_bank",
  "routing_numbers",
];

describe("/institutions/cacheList", () => {
  it("gets institution cache list and filters out institutions without active aggregators", () => {
    cy.request({
      failOnStatusCode: false,
      method: "DELETE",
      url: keysUrl,
      headers: {
        Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
      },
    });

    cy.request({
      method: "POST",
      url: keysUrl,
      headers: {
        ContentType: "application/json",
        Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
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

            expect(
              response.body.find(({ name }) => name === "FinBank Profiles - A"),
            ).to.eq(undefined);

            // Institution Attributes
            institutionAttributes.forEach((attribute) => {
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
                Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
              },
            }).then((response) => {
              expect(response.status).to.eq(200);
            });
          });
      });
    });
  });

  runTokenInvalidCheck({
    url: `http://localhost:${PORT}/institutions/cacheList`,
    method: "GET",
  });
  runInvalidPermissionCheck({
    url: `http://localhost:${PORT}/institutions/cacheList`,
    token_env_var: "NO_WIDGET_PERMISSION_ACCESS_TOKEN",
    method: "GET",
  });
});

describe("POST /institutions (Institution create)", () => {
  runTokenInvalidCheck({
    url: `http://localhost:${PORT}/institutions`,
    method: "POST",
  });
  runInvalidPermissionCheck({
    url: `http://localhost:${PORT}/institutions`,
    token_env_var: "USER_ACCESS_TOKEN",
    method: "POST",
  });

  it("gets 201 created when user has permission to create", () => {
    const getUniqueId = () => Cypress._.uniqueId(Date.now().toString());

    cy.request({
      url: `http://localhost:${PORT}/institutions`,
      method: "POST",
      body: {
        ...testInstitution,
        ucp_id: getUniqueId(),
      },
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(201);

      institutionAttributes.forEach((attribute) => {
        expect(response.body).to.haveOwnProperty(attribute);
      });
    });
  });
});
