import { AUTH0_WIDGET_AUDIENCE } from "@repo/shared-utils";
import { USER_ACCESS_TOKEN_ENV } from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";
import { JwtPayload } from "jsonwebtoken";
import { CachedInstitution } from "tasks/loadInstitutionsFromJson";
import {
  runInvalidPermissionCheck,
  runTokenInvalidCheck,
} from "../support/utils";
import { PORT } from "shared/const";

const keysUrl = `http://localhost:8089/v1/clients/keys`;

type Keys = {
  clientId: string;
  clientSecret: string;
};

const institutionAttributes = [
  "id",
  "name",
  "keywords",
  "logo",
  "url",
  "is_test_bank",
  "routing_numbers",
];

const checkCacheListResponse = (
  response: Cypress.Response<CachedInstitution[]>,
) => {
  const institution = response.body[0];
  const aggregator =
    institution.mx ??
    institution.sophtron ??
    institution.finicity ??
    institution.testExampleA ??
    institution.testExampleB ??
    {};

  expect(response.status).to.eq(200);

  expect(
    response.body.find(({ name }) => name === "FinBank Profiles - A"),
  ).to.eq(undefined);

  // Institution Attributes
  institutionAttributes.forEach((attribute) => {
    expect(institution).to.haveOwnProperty(attribute);
  });

  // Aggregator Attributes
  [
    "id",
    "supports_oauth",
    "supports_identification",
    "supports_aggregation",
    "supports_history",
    "supportsRewards",
    "supportsBalance",
  ].forEach((attribute) => {
    expect(aggregator).to.haveOwnProperty(attribute);
  });
};

const cacheListDownloadUrl = `http://localhost:${PORT}/institutions/cacheList/download`;
const cacheListUrl = `http://localhost:${PORT}/institutions/cacheList`;

describe("get cache lists", () => {
  describe("/institutions/cacheList/download", () => {
    it("gets institution cache list and filters out institutions without active aggregators", () => {
      cy.request({
        url: cacheListDownloadUrl,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
        },
      }).then(checkCacheListResponse);
    });

    runTokenInvalidCheck({
      url: cacheListDownloadUrl,
      method: "GET",
    });
  });

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
            url: cacheListUrl,
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then(checkCacheListResponse)
            .then(() => {
              cy.request({
                method: "DELETE",
                url: keysUrl,
                headers: {
                  Authorization: createAuthorizationHeader(
                    USER_ACCESS_TOKEN_ENV,
                  ),
                },
              }).then((response) => {
                expect(response.status).to.eq(200);
              });
            });
        });
      });
    });

    runTokenInvalidCheck({
      url: cacheListUrl,
      method: "GET",
    });
    runInvalidPermissionCheck({
      url: cacheListUrl,
      token_env_var: "NO_WIDGET_PERMISSION_ACCESS_TOKEN",
      method: "GET",
    });
  });
});
