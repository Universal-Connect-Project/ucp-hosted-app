import { AggregatorInstitution } from "../../../src/models/aggregatorInstitution";
import { PORT } from "../../../src/shared/const";
import { AGGREGATOR_INSTITUTIONS_ROUTE } from "../../../src/shared/consts/routes";
import {
  AGGREGATOR_USER_ACCESS_TOKEN_ENV,
  SUPER_USER_ACCESS_TOKEN_ENV,
  USER_ACCESS_TOKEN_ENV,
} from "../../shared/constants/accessTokens";
import {
  createAndLinkInstitution,
  getAggregatorInstitutions,
} from "../../shared/utils/aggregatorInstitutions";
import { createAuthorizationHeader } from "../../shared/utils/authorization";
import { createTestInstitutionAndAddIntegration } from "../../shared/utils/institutions";
import { runTokenInvalidCheck } from "../../support/utils";

const mxAggregatorId = 98;

describe("aggregator institutions", () => {
  let createdInstitutionId: string;

  beforeEach(() => {
    cy.task("clearAggregatorInstitutions")
      .then(() => cy.task("clearAggregatorIntegrations"))
      .then(() =>
        cy.task("createAggregatorInstitutions", [
          {
            aggregatorId: 1,
            id: 1,
            name: "Bank of the First Order",
            createdAt: new Date("2023-01-01"),
          },
          {
            aggregatorId: 1,
            id: 2,
            name: "Resistance Bank",
            createdAt: new Date("2023-01-02"),
          },
          {
            aggregatorId: 2,
            id: 2,
            name: "Resistance Bank",
            createdAt: new Date("2023-01-03"),
          },
          {
            aggregatorId: 3,
            id: 2,
            name: "Resistance Bank",
            createdAt: new Date("2023-01-04"),
          },
          {
            aggregatorId: 1,
            id: 3,
            name: "Resistance Credit Union",
            createdAt: new Date("2023-01-05"),
          },
          {
            aggregatorId: 1,
            id: 4,
            name: "Resistance Credit Union",
            createdAt: new Date("2023-01-06"),
          },
        ]),
      )
      .then(() =>
        createTestInstitutionAndAddIntegration({
          aggregatorId: 1,
          aggregatorInstitutionId: "4",
        }),
      )
      .then((institutionId) => {
        createdInstitutionId = institutionId;
      });
  });

  describe("POST /aggregatorInstitutions/link", () => {
    runTokenInvalidCheck({
      url: `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_ROUTE}/link`,
      method: "POST",
    });

    it("returns 403 if not super admin or aggregator admin", () => {
      cy.request({
        url: `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_ROUTE}/link`,
        method: "POST",
        headers: {
          Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
        },
        failOnStatusCode: false,
        body: {
          aggregatorId: 1,
          aggregatorInstitutionId: "1",
          institutionId: "institution-id",
        },
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body).to.have.property(
          "error",
          "Insufficient permissions",
        );
      });
    });

    it("returns 403 if aggregator admin, but not for their aggregator", () => {
      cy.request({
        url: `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_ROUTE}/link`,
        method: "POST",
        headers: {
          Authorization: createAuthorizationHeader(
            AGGREGATOR_USER_ACCESS_TOKEN_ENV,
          ),
        },
        failOnStatusCode: false,
        body: {
          aggregatorId: 1,
          aggregatorInstitutionId: "1",
          institutionId: "institution-id",
        },
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body).to.have.property(
          "error",
          "An Aggregator cannot create an aggregatorIntegration belonging to another aggregator",
        );
      });
    });

    describe("successful linking", () => {
      const createdAggregatorInstitutionId = "4";

      beforeEach(() => {
        cy.task("createAggregatorInstitutions", [
          {
            aggregatorId: mxAggregatorId,
            id: createdAggregatorInstitutionId,
            name: "MX Aggregator Institution",
            createdAt: new Date("2023-01-06"),
          },
        ]);
      });

      it("links an institution to an aggregator institution as a super admin", () => {
        cy.request({
          url: `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_ROUTE}/link`,
          method: "POST",
          headers: {
            Authorization: createAuthorizationHeader(
              SUPER_USER_ACCESS_TOKEN_ENV,
            ),
          },
          body: {
            aggregatorId: mxAggregatorId,
            aggregatorInstitutionId: createdAggregatorInstitutionId,
            institutionId: createdInstitutionId,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property(
            "message",
            "Aggregator Institution linked successfully",
          );
        });
      });

      it("links an institution to an aggregator institution as an aggregator admin", () => {
        cy.request({
          url: `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_ROUTE}/link`,
          method: "POST",
          headers: {
            Authorization: createAuthorizationHeader(
              AGGREGATOR_USER_ACCESS_TOKEN_ENV,
            ),
          },
          body: {
            aggregatorId: mxAggregatorId,
            aggregatorInstitutionId: createdAggregatorInstitutionId,
            institutionId: createdInstitutionId,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property(
            "message",
            "Aggregator Institution linked successfully",
          );
        });
      });
    });
  });

  describe("POST /aggregatorInstitutions/createAndLinkInstitution", () => {
    const createdAggregatorInstitutionId = "4";

    const validBody = {
      aggregatorId: mxAggregatorId,
      aggregatorInstitutionId: createdAggregatorInstitutionId,
      institutionData: {
        keywords: ["new", "institution"],
        name: "New Institution",
        routing_numbers: ["123456789"],
        url: "https://newinstitution.com",
        logo: "https://newinstitution.com/logo.png",
      },
    };

    beforeEach(() => {
      cy.task("createAggregatorInstitutions", [
        {
          aggregatorId: mxAggregatorId,
          id: createdAggregatorInstitutionId,
          name: "MX Aggregator Institution",
          createdAt: new Date("2023-01-06"),
        },
      ]);
    });

    runTokenInvalidCheck({
      url: `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_ROUTE}/createAndLinkInstitution`,
      method: "POST",
    });

    it("creates and links an institution to an aggregator institution as a super admin", () => {
      createAndLinkInstitution({
        accessTokenEnv: SUPER_USER_ACCESS_TOKEN_ENV,
        body: validBody,
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property(
          "message",
          "Institution created and linked successfully",
        );
        expect(response.body).to.have.property("institutionId");
      });
    });

    it("creates and links an institution to an aggregator institution as an aggregator admin", () => {
      createAndLinkInstitution({
        accessTokenEnv: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        body: validBody,
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property(
          "message",
          "Institution created and linked successfully",
        );
        expect(response.body).to.have.property("institutionId");
      });
    });

    it("responds with 403 Forbidden when trying to create an institution with a linked aggregatorInstitution from a different aggregator", () => {
      createAndLinkInstitution({
        accessTokenEnv: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        body: { ...validBody, aggregatorId: 1 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body).to.have.property(
          "error",
          "An Aggregator cannot create an aggregatorIntegration belonging to another aggregator",
        );
      });
    });

    it("responds with 403 Forbidden when trying to createAndLink as a regular user", () => {
      createAndLinkInstitution({
        accessTokenEnv: USER_ACCESS_TOKEN_ENV,
        body: { ...validBody, aggregatorId: 1 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body).to.include("Insufficient Scope");
      });
    });

    it("responds with 400 Bad Request when request body is invalid", () => {
      createAndLinkInstitution({
        accessTokenEnv: SUPER_USER_ACCESS_TOKEN_ENV,
        body: {
          ...validBody,
          aggregatorId: undefined,
        },
        failOnStatusCode: false,
      }).then((response: Cypress.Response<{ error: string }>) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property("error");
        expect(response.body.error).to.eq('"aggregatorId" is required');
      });
    });
  });

  describe("GET /aggregatorInstitutions/:aggregatorId/:id", () => {
    runTokenInvalidCheck({
      url: `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_ROUTE}/1/4`,
      method: "GET",
    });

    it("retrieves an aggregator institution by aggregatorId and id, includes matched institutions", () => {
      cy.request({
        url: `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_ROUTE}/1/4`,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
        },
      }).then(
        (
          response: Cypress.Response<{
            institution: {
              id: string;
              aggregatorId: number;
              name: string;
              institutions: { aggregatorId: number; id: string }[];
            };
          }>,
        ) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("institution");
          expect(response.body.institution).to.have.property("id", "4");
          expect(response.body.institution).to.have.property("aggregatorId", 1);
          expect(response.body.institution).to.have.property(
            "name",
            "Resistance Credit Union",
          );
          expect(response.body.institution.institutions).to.have.length(1);

          const [firstMatchedInstitution] =
            response.body.institution.institutions;

          expect(firstMatchedInstitution.id).to.eq(createdInstitutionId);
        },
      );
    });
  });

  describe("GET /aggregatorInstitutions", () => {
    runTokenInvalidCheck({
      url: `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_ROUTE}`,
      method: "GET",
    });

    it("paginates, filters by aggregators, searches by resistance, doesn't include matched, sorts by name:DESC", () => {
      getAggregatorInstitutions({
        qs: {
          aggregatorIds: "1,2",
          page: "1",
          pageSize: "1",
          search: "resistance",
          shouldIncludeMatched: "false",
          sortBy: "name:DESC",
        },
      }).then(
        (
          response: Cypress.Response<{
            aggregatorInstitutions: AggregatorInstitution[];
            currentPage: number;
            totalPages: number;
            totalRecords: number;
          }>,
        ) => {
          expect(response.status).to.eq(200);
          expect(response.body.aggregatorInstitutions.length).to.eq(1);
          expect(response.body.totalRecords).to.eq(3);
          expect(response.body.currentPage).to.eq(1);
          expect(response.body.totalPages).to.eq(3);

          const firstResult = response.body.aggregatorInstitutions[0];

          expect(firstResult.name).to.eq("Resistance Credit Union");
          expect(firstResult.aggregatorId).to.eq(1);
          expect(firstResult.id).to.eq("3");
        },
      );
    });

    it("doesn't filter by aggregatorIds, uses a bigger page size, includes matched, doesn't search, sortsBy createdAt:DESC", () => {
      getAggregatorInstitutions({
        qs: {
          page: "1",
          pageSize: "100",
          shouldIncludeMatched: "true",
          sortBy: "createdAt:DESC",
        },
      }).then(
        (
          response: Cypress.Response<{
            aggregatorInstitutions: AggregatorInstitution[];
            currentPage: number;
            totalPages: number;
            totalRecords: number;
          }>,
        ) => {
          expect(response.status).to.eq(200);
          expect(response.body.aggregatorInstitutions.length).to.eq(6);
          expect(response.body.totalRecords).to.eq(6);
          expect(response.body.currentPage).to.eq(1);
          expect(response.body.totalPages).to.eq(1);

          const firstResult = response.body.aggregatorInstitutions[0];

          expect(firstResult.name).to.eq("Resistance Credit Union");
          expect(firstResult.aggregatorId).to.eq(1);
          expect(firstResult.id).to.eq("4");
        },
      );
    });
  });
});
