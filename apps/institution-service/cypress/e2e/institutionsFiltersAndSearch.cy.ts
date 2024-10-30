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
  let integrationFilterQueryParam;
  if (integrationFieldFilter) {
    integrationFilterQueryParam = integrationFieldFilter
      .map((integrationField) => `${integrationField}=true&`)
      .join("");
  } else {
    integrationFilterQueryParam = "";
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
    url: `http://localhost:${PORT}/institutions?pageSize=50&${integrationFilterQueryParam}${searchQueryParam}${aggregatorFilterQueryParam}`,
    method: "GET",
    headers: {
      Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
    },
  });
};

describe("/institutions with filters and search", () => {
  it("gets a list of institutions including mx or sophtron or finicity aggregators", () => {
    getInstitutionsRequest({
      aggregatorFilter: ["mx", "sophtron", "finicity"],
    }).then(
      (response: Cypress.Response<{ institutions: InstitutionDetail[] }>) => {
        const institutionResponse = response.body;

        expect(response.status).to.eq(200);
        institutionResponse.institutions.forEach((institution) => {
          expect(institution.aggregatorIntegrations.length).to.be.gte(1);
          let mxFound = false;
          let sophtronFound = false;
          let finicityFound = false;
          institution.aggregatorIntegrations.forEach((integration) => {
            if (integration.aggregator.name === "mx") {
              mxFound = true;
            } else if (integration.aggregator.name === "sophtron") {
              sophtronFound = true;
            } else if (integration.aggregator.name === "finicity") {
              finicityFound = true;
            }
          });
          expect(mxFound || sophtronFound || finicityFound).to.be.true;
        });
      },
    );
  });

  it("gets a list of institutions that have support for all of these job types", () => {
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
            let jobTypeSupported = false;
            if (
              aggInt.supports_aggregation ||
              aggInt.supports_identification ||
              aggInt.supports_verification ||
              aggInt.supports_history
            ) {
              jobTypeSupported = true;
            }
            expect(jobTypeSupported).to.be.true;
          });
        });
      },
    );
  });

  it("institution list by default only includes institutions which have at least one active integration", () => {
    getInstitutionsRequest({}).then(
      (response: Cypress.Response<{ institutions: InstitutionDetail[] }>) => {
        response.body.institutions.forEach((institution) => {
          let hasActiveIntegration = false;
          institution.aggregatorIntegrations.forEach((aggInt) => {
            if (aggInt.isActive) {
              hasActiveIntegration = true;
            }
          });
          expect(hasActiveIntegration).to.be.true;
        });
      },
    );
  });

  it("gets a list of active institutions with mx agg support and supports_history", () => {
    getInstitutionsRequest({
      integrationFieldFilter: ["supportsHistory"],
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
      integrationFieldFilter: ["supportsHistory", "supportsOauth"],
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
      integrationFieldFilter: ["supportsHistory", "supportsOauth"],
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

  it("includes institutions with inactive integrations when includeInactiveIntegrations is passed", () => {
    getInstitutionsRequest({
      aggregatorFilter: ["testExampleA"],
      search: "noneActive",
      integrationFieldFilter: ["includeInactiveIntegrations"],
    }).then(
      (response: Cypress.Response<{ institutions: InstitutionDetail[] }>) => {
        let inactiveInstitutionFound = false;
        response.body.institutions.forEach((institution) => {
          let activeAggregatorFound = false;
          institution.aggregatorIntegrations.forEach((aggInt) => {
            if (aggInt.isActive) {
              activeAggregatorFound = true;
            }
          });
          if (!activeAggregatorFound) {
            inactiveInstitutionFound = true;
          }
        });
        expect(inactiveInstitutionFound).to.be.true;
      },
    );
  });

  it("exludes institutions with inactive integrations when includeInactiveIntegrations is not passed", () => {
    getInstitutionsRequest({
      aggregatorFilter: ["testExampleA"],
      search: "noneActive",
    }).then(
      (response: Cypress.Response<{ institutions: InstitutionDetail[] }>) => {
        expect(response.body.institutions.length).to.eq(0);
      },
    );
  });

  it("includes institutions that have an mx integration with extended_history", () => {
    getInstitutionsRequest({
      aggregatorFilter: ["mx"],
      integrationFieldFilter: ["supportsHistory"],
    }).then(
      (response: Cypress.Response<{ institutions: InstitutionDetail[] }>) => {
        response.body.institutions.forEach((institution) => {
          let mxIntegrationWithHistoryFound = false;
          institution.aggregatorIntegrations.forEach((aggInt) => {
            if (aggInt.aggregator.name === "mx" && aggInt.supports_history) {
              mxIntegrationWithHistoryFound = true;
            }
          });
          expect(mxIntegrationWithHistoryFound).to.be.true;
        });
      },
    );
  });
});
