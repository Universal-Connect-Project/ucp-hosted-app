import { AUTH0_WIDGET_AUDIENCE } from "@repo/shared-utils";
import { JwtPayload } from "jsonwebtoken";
import {
  InstitutionDetail,
  PaginatedInstitutionsResponse,
} from "../../src/controllers/institutionController";
import { DEFAULT_PAGINATION_PAGE_SIZE, PORT } from "../../src/shared/const";
import { CachedInstitution } from "../../src/tasks/loadInstitutionsFromJson";
import { testInstitution } from "../../src/test/testData/institutions";
import {
  AGGREGATOR_USER_ACCESS_TOKEN_ENV,
  SUPER_USER_ACCESS_TOKEN_ENV,
  USER_ACCESS_TOKEN_ENV,
} from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";
import {
  runInvalidPermissionCheck,
  runTokenInvalidCheck,
} from "../support/utils";

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

const validUpdateParams = {
  name: "newName",
  keywords: ["newKeywords"],
  logo: "https://logo.com",
  url: "https://url.com",
  is_test_bank: true,
  routing_numbers: ["123456789"],
};

interface institutionTestCase {
  description: string;
  body: {
    id?: string;
    name: string;
    keywords: string[];
    logo: string;
    url: string;
    is_test_bank: boolean;
    routing_numbers: string[];
  };
  expectedStatus: number;
  expectedMessage: string;
}

const institutionValidationTestCases: institutionTestCase[] = [
  {
    description: "routing number is invalid",
    body: {
      ...validUpdateParams,
      routing_numbers: ["123"],
    },
    expectedStatus: 400,
    expectedMessage:
      '"routing_numbers[0]" with value "123" fails to match the 9 digits pattern',
  },
  {
    description: "logo is invalid",
    body: {
      ...validUpdateParams,
      logo: "junk",
    },
    expectedStatus: 400,
    expectedMessage:
      '"logo" must be a valid uri with a scheme matching the http|https pattern',
  },
  {
    description: "url is invalid",
    body: {
      ...validUpdateParams,
      url: "junk",
    },
    expectedStatus: 400,
    expectedMessage:
      '"url" must be a valid uri with a scheme matching the http|https pattern',
  },
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
            const aggregator =
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

            // Aggregator Attributes
            [
              "id",
              "supports_oauth",
              "supports_identification",
              "supports_aggregation",
              "supports_history",
            ].forEach((attribute) => {
              expect(aggregator).to.haveOwnProperty(attribute);
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
    body: testInstitution,
  });

  institutionValidationTestCases.forEach((testCase) => {
    it(`should fail validation when ${testCase.description}`, () => {
      cy.request({
        url: `http://localhost:${PORT}/institutions`,
        method: "POST",
        body: testCase.body,
        headers: {
          Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
        },
        failOnStatusCode: false,
      }).then((response: Cypress.Response<{ error: string }>) => {
        expect(response.status).to.eq(testCase.expectedStatus);
        expect(response.body.error).to.include(testCase.expectedMessage);
      });
    });
  });

  it("gets 201 created when user has permission to create", () => {
    // Create as SUPER USER
    cy.request({
      url: `http://localhost:${PORT}/institutions`,
      method: "POST",
      body: {
        ...testInstitution,
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

    // Create as Aggregator admin
    cy.request({
      url: `http://localhost:${PORT}/institutions`,
      method: "POST",
      body: {
        ...testInstitution,
      },
      headers: {
        Authorization: createAuthorizationHeader(
          AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        ),
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(201);

      institutionAttributes.forEach((attribute) => {
        expect(response.body).to.haveOwnProperty(attribute);
      });
    });
  });
});

let newInstitutionData: { id: string };

describe("PUT /institutions/:id (Institution update)", () => {
  before(() => {
    cy.request({
      url: `http://localhost:${PORT}/institutions`,
      method: "POST",
      body: {
        ...testInstitution,
      },
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
    }).then((response: Cypress.Response<{ id: string }>) => {
      newInstitutionData = response.body;
    });
  });

  runTokenInvalidCheck({
    url: `http://localhost:${PORT}/institutions/${newInstitutionData?.id}`,
    method: "PUT",
  });

  runInvalidPermissionCheck({
    url: `http://localhost:${PORT}/institutions/${newInstitutionData?.id}`,
    token_env_var: "USER_ACCESS_TOKEN",
    method: "PUT",
  });

  it("gets 404 when trying to update an institution with invalid institution id", () => {
    cy.request({
      url: `http://localhost:${PORT}/institutions/wrongInstitutionId`,
      method: "PUT",
      body: validUpdateParams,
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
      failOnStatusCode: false,
    }).then((response: Cypress.Response<{ error: string }>) => {
      expect(response.status).to.eq(404);
      expect(response.body.error).to.eq("Institution not found");
    });
  });

  it("gets 404 when trying to update an institution that doesnt exist", () => {
    cy.request({
      url: `http://localhost:${PORT}/institutions/df25313d-d78c-458a-94c3-e20fdd2b94ce`,
      method: "PUT",
      body: validUpdateParams,
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
      failOnStatusCode: false,
    }).then((response: Cypress.Response<{ error: string }>) => {
      expect(response.status).to.eq(404);
      expect(response.body.error).to.eq("Institution not found");
    });
  });

  it("gets 200 updated when user has permission to update and params are valid", () => {
    cy.request({
      url: `http://localhost:${PORT}/institutions/${newInstitutionData.id}`,
      method: "PUT",
      body: validUpdateParams,
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(200);
    });
  });

  institutionValidationTestCases.forEach((testCase) => {
    it(`should fail validation when ${testCase.description}`, () => {
      cy.request({
        url: `http://localhost:${PORT}/institutions/${newInstitutionData.id}`,
        method: "PUT",
        body: testCase.body,
        headers: {
          Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
        },
        failOnStatusCode: false,
      }).then((response: Cypress.Response<{ error: string }>) => {
        expect(response.status).to.eq(testCase.expectedStatus);
        expect(response.body.error).to.include(testCase.expectedMessage);
      });
    });
  });

  it("should prevent an aggregator from updating institutions with other aggregator implementations", () => {
    const institutionWithOtherAggregatorImplementationsId =
      "ee6d71dc-e693-4fc3-a775-53c378bc5066"; // Alabama Credit Union
    cy.request({
      url: `http://localhost:${PORT}/institutions/${institutionWithOtherAggregatorImplementationsId}`,
      method: "PUT",
      body: validUpdateParams,
      headers: {
        Authorization: createAuthorizationHeader(
          AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        ),
      },
      failOnStatusCode: false,
    }).then((response: Cypress.Response<{ error: string }>) => {
      expect(response.status).to.eq(403);
      expect(response.body.error).to.include(
        "Aggregator cannot edit an institution used by other aggregators",
      );
    });
  });

  it("should allow an aggregator to update institutions with no other aggregator implementations", () => {
    const institutionWithNoAggregators = "12d9889b-d74e-4e67-8161-96aa2b8c52da"; // testNoAggregators
    cy.request({
      url: `http://localhost:${PORT}/institutions/${institutionWithNoAggregators}`,
      method: "PUT",
      body: { ...validUpdateParams, name: "testNoAggregators" },
      headers: {
        Authorization: createAuthorizationHeader(
          AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        ),
      },
      failOnStatusCode: false,
    }).then((response: Cypress.Response<{ error: string }>) => {
      expect(response.status).to.eq(200);
    });
  });

  it("should allow an aggregator to update when it is the only implementation on the institution", () => {
    const testExampleInstitutionId = "5e498f60-3496-4299-96ed-f8eb328ae8af"; // testExampleA
    cy.request({
      url: `http://localhost:${PORT}/institutions/${testExampleInstitutionId}`,
      method: "PUT",
      body: { ...validUpdateParams, name: "testExampleA" },
      headers: {
        Authorization: createAuthorizationHeader(
          AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        ),
      },
      failOnStatusCode: false,
    }).then((response: Cypress.Response<{ error: string }>) => {
      expect(response.status).to.eq(200);
    });
  });
});

describe("/institutions", () => {
  it("gets paginated institution list with default pagination options", () => {
    cy.request({
      url: `http://localhost:${PORT}/institutions`,
      method: "GET",
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
    }).then((response: Cypress.Response<{ body: unknown }>) => {
      const institutionResponse =
        response.body as unknown as PaginatedInstitutionsResponse;

      expect(response.status).to.eq(200);

      // Should have pagination properties
      expect(institutionResponse.currentPage).to.eq(1);
      expect(institutionResponse.pageSize).to.eq(DEFAULT_PAGINATION_PAGE_SIZE);
      expect(institutionResponse.totalRecords).to.be.greaterThan(100);
      expect(institutionResponse.totalPages).to.be.greaterThan(100);
      expect(institutionResponse.institutions.length).to.eq(
        DEFAULT_PAGINATION_PAGE_SIZE,
      );

      institutionResponse.institutions.forEach((institution) => {
        [
          "id",
          "name",
          "keywords",
          "logo",
          "url",
          "is_test_bank",
          "routing_numbers",
          "createdAt",
          "updatedAt",
          "aggregatorIntegrations",
        ].forEach((attribute) => {
          expect(institution).to.haveOwnProperty(attribute);
        });
      });
    });
  });

  it("gets paginated institution list with custom pagination options", () => {
    const PAGE_SIZE = 3;
    const PAGE = 5;
    cy.request({
      url: `http://localhost:${PORT}/institutions?page=${PAGE}&pageSize=${PAGE_SIZE}`,
      method: "GET",
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
    }).then((response: Cypress.Response<{ body: unknown }>) => {
      const institutionResponse =
        response.body as unknown as PaginatedInstitutionsResponse;

      expect(response.status).to.eq(200);

      // Should have pagination properties
      expect(institutionResponse.currentPage).to.eq(PAGE);
      expect(institutionResponse.pageSize).to.eq(PAGE_SIZE);
      expect(institutionResponse.totalRecords).to.be.greaterThan(100);
      expect(institutionResponse.totalPages).to.be.greaterThan(100);
      expect(institutionResponse.institutions.length).to.eq(PAGE_SIZE);
    });
  });

  runTokenInvalidCheck({
    url: `http://localhost:${PORT}/institutions`,
    method: "GET",
  });
});

interface InstitutionDetailResponse {
  institution: InstitutionDetail;
}
describe("GET /institutions/:id (Institution Details)", () => {
  it("gets Alabama Credit Union in the response on success", () => {
    cy.request({
      url: `http://localhost:${PORT}/institutions/ee6d71dc-e693-4fc3-a775-53c378bc5066`,
      method: "GET",
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
    }).then(
      (
        response: Cypress.Response<{
          institution: InstitutionDetail;
        }>,
      ) => {
        expect(response.status).to.eq(200);

        expect(response.body.institution.name).to.eq("Alabama Credit Union");

        expect(response.body).to.have.property("institution");
        expect(response.body.institution).to.be.an("object");

        [
          "id",
          "name",
          "keywords",
          "logo",
          "url",
          "is_test_bank",
          "routing_numbers",
          "createdAt",
          "updatedAt",
          "aggregatorIntegrations",
        ].forEach((key) => {
          expect(response.body.institution).to.have.property(key);
        });

        expect(response.body.institution.aggregatorIntegrations).to.be.an(
          "array",
        );
        response.body.institution.aggregatorIntegrations.forEach(
          (integration) => {
            [
              "id",
              "aggregator_institution_id",
              "supports_oauth",
              "supports_identification",
              "supports_verification",
              "supports_aggregation",
              "supports_history",
            ].forEach((key) => {
              expect(integration).to.have.property(key);
            });

            expect(integration.aggregator).to.be.an("object");

            ["name", "id", "displayName", "logo"].forEach((key) => {
              expect(integration.aggregator).to.have.property(key);
            });
          },
        );
      },
    );
  });

  it("gets a 404 and error response if id doesnt match an institution", () => {
    cy.request({
      url: `http://localhost:${PORT}/institutions/ee6d71dc-e693-4fc3-a775-53c378bc506a`,
      method: "GET",
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
      failOnStatusCode: false,
    }).then(
      (response: Cypress.Response<{ institution: InstitutionDetail }>) => {
        const institutionResponse =
          response.body as unknown as InstitutionDetailResponse;

        expect(response.status).to.eq(404);

        expect(institutionResponse).to.contain({
          error: "Institution not found",
        });
      },
    );
  });

  runTokenInvalidCheck({
    url: `http://localhost:${PORT}/institutions/ee6d71dc-e693-4fc3-a775-53c378bc5066`,
    method: "GET",
  });
});
