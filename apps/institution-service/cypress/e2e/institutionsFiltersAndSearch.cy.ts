import { InstitutionDetail } from "controllers/institutionController";
import { PORT } from "shared/const";
import { SUPER_USER_ACCESS_TOKEN_ENV } from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";

const getInstitutionsRequest = ({
  integrationFieldFilter,
  search,
  aggregatorFilter,
}: {
  integrationFieldFilter?: string[];
  search?: string;
  aggregatorFilter?: string[];
}) => {
  let jobTypeFilterQueryParam;
  if (integrationFieldFilter) {
    jobTypeFilterQueryParam = integrationFieldFilter
      .map((jobType) => `${jobType}=true&`)
      .join("");
  } else {
    jobTypeFilterQueryParam = "";
  }

  const searchQueryParam = search ? `search=${search}&` : "";

  let aggregatorFilterQueryParam;
  if (aggregatorFilter) {
    aggregatorFilterQueryParam = aggregatorFilter
      .map((aggregator) => `aggregatorName=${aggregator}`)
      .join("&");
  } else {
    aggregatorFilterQueryParam = "";
  }

  return cy.request({
    url: `http://localhost:${PORT}/institutions?pageSize=50&${jobTypeFilterQueryParam}${searchQueryParam}${aggregatorFilterQueryParam}`,
    method: "GET",
    headers: {
      Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
    },
  });
};

describe("/institutions with filters and search", () => {
  it("gets a list of institutions including mx, sophtron, and finicity aggregators", () => {
    getInstitutionsRequest({
      aggregatorFilter: ["mx", "sophtron", "finicity"],
    }).then(
      (response: Cypress.Response<{ institutions: InstitutionDetail[] }>) => {
        const institutionResponse = response.body;

        expect(response.status).to.eq(200);
        institutionResponse.institutions.forEach((institution) => {
          expect(institution.aggregatorIntegrations.length).to.be.gte(3);
          let mxFound = false;
          let sohptronFound = false;
          let finicityFound = false;
          institution.aggregatorIntegrations.forEach((integration) => {
            if (integration.aggregator.name === "mx") {
              mxFound = true;
            } else if (integration.aggregator.name === "sophtron") {
              sohptronFound = true;
            } else if (integration.aggregator.name === "finicity") {
              finicityFound = true;
            }
          });
          expect(mxFound).to.be.true;
          expect(sohptronFound).to.be.true;
          expect(finicityFound).to.be.true;
        });
      },
    );
  });

  it("gets a list of institutions that have support for all job types", () => {
    getInstitutionsRequest({
      integrationFieldFilter: [
        "supportsIdentification",
        "supportsVerification",
        "supportsAggregation",
        "supportsHistory",
      ],
    }).then(
      (response: Cypress.Response<{ institutions: InstitutionDetail[] }>) => {
        response.body.institutions.forEach((institution) => {
          institution.aggregatorIntegrations.forEach((aggInt) => {
            expect(aggInt.supports_aggregation).to.be.true;
            expect(aggInt.supports_identification).to.be.true;
            expect(aggInt.supports_verification).to.be.true;
            expect(aggInt.supports_history).to.be.true;
          });
        });
      },
    );
  });

  it("gets a list of institutions that have isActive = true", () => {
    getInstitutionsRequest({
      integrationFieldFilter: ["isActive"],
    }).then(
      (response: Cypress.Response<{ institutions: InstitutionDetail[] }>) => {
        response.body.institutions.forEach((institution) => {
          institution.aggregatorIntegrations.forEach((aggInt) => {
            expect(aggInt.isActive).to.be.true;
          });
        });
      },
    );
  });

  it("gets a list of active institutions with mx agg support and supports_history", () => {
    getInstitutionsRequest({
      integrationFieldFilter: ["isActive", "supportsHistory"],
      aggregatorFilter: ["mx"],
    }).then(
      (response: Cypress.Response<{ institutions: InstitutionDetail[] }>) => {
        response.body.institutions.forEach((institution) => {
          let hasExpectedAttributes = false;
          institution.aggregatorIntegrations.forEach((aggInt) => {
            if (aggInt.aggregator.name === "mx") {
              hasExpectedAttributes =
                aggInt.isActive || aggInt.supports_history;
            }
          });
          expect(hasExpectedAttributes).to.be.true;
        });
      },
    );
  });

  it("gets a list of active institutions with mx agg support and supports_history and has OAuth", () => {
    getInstitutionsRequest({
      integrationFieldFilter: ["isActive", "supportsHistory", "supportsOauth"],
      aggregatorFilter: ["mx"],
    }).then(
      (response: Cypress.Response<{ institutions: InstitutionDetail[] }>) => {
        response.body.institutions.forEach((institution) => {
          let hasExpectedAttributes = false;
          institution.aggregatorIntegrations.forEach((aggInt) => {
            if (aggInt.aggregator.name === "mx") {
              hasExpectedAttributes =
                aggInt.isActive ||
                aggInt.supports_history ||
                aggInt.supports_oauth;
            }
          });
          expect(hasExpectedAttributes).to.be.true;
        });
      },
    );
  });

  it("gets a list of active institutions with mx agg support, supports_history, has OAuth and 'Bank' in the name", () => {
    getInstitutionsRequest({
      integrationFieldFilter: ["isActive", "supportsHistory", "supportsOauth"],
      aggregatorFilter: ["mx"],
      search: "Bank",
    }).then(
      (response: Cypress.Response<{ institutions: InstitutionDetail[] }>) => {
        response.body.institutions.forEach((institution) => {
          expect(institution.name).to.include("Bank");
          let hasExpectedAttributes = false;
          institution.aggregatorIntegrations.forEach((aggInt) => {
            if (aggInt.aggregator.name === "mx") {
              hasExpectedAttributes =
                aggInt.isActive ||
                aggInt.supports_history ||
                aggInt.supports_oauth;
            }
          });
          expect(hasExpectedAttributes).to.be.true;
        });
      },
    );
  });

  it("gets a list of active institutions with 'testExample' in the name", () => {
    getInstitutionsRequest({
      search: "testExample",
    }).then(
      (response: Cypress.Response<{ institutions: InstitutionDetail[] }>) => {
        response.body.institutions.forEach((institution) => {
          expect(institution.name.toLowerCase()).to.include("testexample");
        });
      },
    );
  });
});
