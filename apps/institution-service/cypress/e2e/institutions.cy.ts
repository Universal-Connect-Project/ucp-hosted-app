import { Institution } from "../../src/models/institution";
import { checkIsSorted } from "../../src/test/utils";
import {
  InstitutionDetail,
  PaginatedInstitutionsResponse,
} from "institutions/consts";
import { DEFAULT_PAGINATION_PAGE_SIZE, PORT } from "../../src/shared/const";
import { testInstitution } from "../../src/test/testData/institutions";
import {
  AGGREGATOR_USER_ACCESS_TOKEN_ENV,
  SUPER_USER_ACCESS_TOKEN_ENV,
} from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";
import {
  createTestInstitution,
  createTestInstitutionAndAddIntegration,
  deleteInstitution,
  getInstitutionsWithFiltersRequest,
} from "../shared/utils/institutions";
import {
  runInvalidPermissionCheck,
  runTokenInvalidCheck,
} from "../support/utils";
import { mxAggregatorId } from "test/testData/aggregators";

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
  logo: null,
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
  expectedResponse: { error?: string; message?: string };
}

const institutionValidationTestCases: institutionTestCase[] = [
  {
    description: "routing number is invalid",
    body: {
      ...validUpdateParams,
      routing_numbers: ["123"],
    },
    expectedStatus: 400,
    expectedResponse: {
      error:
        '"routing_numbers[0]" with value "123" fails to match the 9 digits pattern',
    },
  },
  {
    description: "logo is invalid",
    body: {
      ...validUpdateParams,
      logo: "junk",
    },
    expectedStatus: 400,
    expectedResponse: {
      error:
        '"logo" must be a valid uri with a scheme matching the http|https pattern',
    },
  },
  {
    description: "url is invalid",
    body: {
      ...validUpdateParams,
      url: "junk",
    },
    expectedStatus: 400,
    expectedResponse: {
      error:
        '"url" must be a valid uri with a scheme matching the http|https pattern',
    },
  },
];

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
      }).then(
        (response: Cypress.Response<{ error?: string; message?: string }>) => {
          expect(response.status).to.eq(testCase.expectedStatus);
          expect(response.body).to.include(testCase.expectedResponse);
        },
      );
    });
  });

  it("gets 201 created when user has permission to create", () => {
    // Create as SUPER USER
    createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV).then(
      (
        response: Cypress.Response<{
          message: string;
          institution: Institution;
        }>,
      ) => {
        expect(response.status).to.eq(201);

        institutionAttributes.forEach((attribute) => {
          expect(response.body.institution).to.haveOwnProperty(attribute);
        });

        deleteInstitution({ institutionId: response.body.institution.id });
      },
    );

    // Create as Aggregator admin
    createTestInstitution(AGGREGATOR_USER_ACCESS_TOKEN_ENV).then(
      (
        response: Cypress.Response<{
          message: string;
          institution: Institution;
        }>,
      ) => {
        expect(response.status).to.eq(201);

        institutionAttributes.forEach((attribute) => {
          expect(response.body.institution).to.haveOwnProperty(attribute);
        });

        deleteInstitution({ institutionId: response.body.institution.id });
      },
    );
  });
});

describe("PUT /institutions/:id (Institution update)", () => {
  let newInstitutionData: Institution;

  before(() => {
    createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV).then(
      (response: Cypress.Response<{ institution: Institution }>) => {
        newInstitutionData = response.body.institution;
      },
    );
  });

  after(() => {
    deleteInstitution({ institutionId: newInstitutionData.id });
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
        expect(response.body).to.include(testCase.expectedResponse);
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
    cy.request({
      url: `http://localhost:${PORT}/institutions/${newInstitutionData.id}`,
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

  describe("tests that need institution cleanup", () => {
    let institutionId: string;

    before(() => {
      createTestInstitutionAndAddIntegration(mxAggregatorId).then(
        (createdInstitutionId) => {
          institutionId = createdInstitutionId;
        },
      );
    });

    after(() => {
      if (institutionId) {
        deleteInstitution({ institutionId }).then(() => {
          institutionId = undefined;
        });
      }
    });

    it("should allow an aggregator to update when it is the only implementation on the institution", () => {
      cy.request({
        url: `http://localhost:${PORT}/institutions/${institutionId}`,
        method: "PUT",
        body: { ...validUpdateParams, name: "Updated name" },
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

  it("gets filtered results when aggregator, job type, and search are passed in the url", () => {
    const searchKeyword = "america";
    getInstitutionsWithFiltersRequest({
      integrationFieldFilter: ["supportsAggregation", "supportsHistory"],
      search: searchKeyword,
      aggregatorFilter: ["mx"],
    }).then(
      (response: Cypress.Response<{ institutions: InstitutionDetail[] }>) => {
        response.body.institutions.forEach((institution) => {
          const searchValidated =
            institution.name.toLowerCase().includes(searchKeyword) ||
            institution.keywords.some((keyword) =>
              keyword.toLowerCase().includes(searchKeyword),
            );
          const hasExpectedAttributes = institution.aggregatorIntegrations.some(
            (integration) =>
              integration.supports_aggregation &&
              integration.supports_history &&
              integration.aggregator.name === "mx",
          );
          expect(hasExpectedAttributes && searchValidated).to.be.true;
        });
      },
    );
  });

  it("gets sorted institution list with default sort options", () => {
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
      expect(
        checkIsSorted(institutionResponse.institutions, "createdAt", "desc"),
      ).to.be.true;
    });
  });

  it("gets sorted institution list with a custom sort option", () => {
    cy.request({
      url: `http://localhost:${PORT}/institutions?sortBy=id:desc`,
      method: "GET",
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
    }).then((response: Cypress.Response<{ body: unknown }>) => {
      const institutionResponse =
        response.body as unknown as PaginatedInstitutionsResponse;

      expect(response.status).to.eq(200);
      expect(checkIsSorted(institutionResponse.institutions, "id", "desc")).to
        .be.true;
    });
  });

  runTokenInvalidCheck({
    url: `http://localhost:${PORT}/institutions`,
    method: "GET",
  });
});
