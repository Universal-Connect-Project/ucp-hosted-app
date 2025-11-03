import { PORT } from "../../../src/shared/const";
import { SUPER_USER_ACCESS_TOKEN_ENV } from "../constants/accessTokens";
import { createAuthorizationHeader } from "./authorization";
import { getAggregators } from "./aggregator";
import { testInstitution } from "../../../src/test/testData/institutions";
import { Aggregator } from "../../../src/models/aggregator";
import { createTestAggregatorIntegration } from "./aggregatorIntegration";
import { Institution } from "../../../src/models/institution";

export const getInstitutionsWithFiltersRequest = ({
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

export const getInstitution = ({
  institutionId,
}: {
  institutionId: string;
}) => {
  return cy.request({
    url: `http://localhost:${PORT}/institutions/${institutionId}`,
    method: "GET",
    headers: {
      Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
    },
    failOnStatusCode: false,
  });
};

export const deleteInstitution = ({
  institutionId,
}: {
  institutionId: string;
}) => {
  return cy.request({
    url: `http://localhost:${PORT}/institutions/${institutionId}`,
    method: "DELETE",
    headers: {
      Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
    },
    failOnStatusCode: false,
  });
};

export const createTestInstitution = (
  token: string,
  institution?: Partial<Institution>,
) => {
  return cy.request({
    url: `http://localhost:${PORT}/institutions`,
    method: "POST",
    body: {
      ...testInstitution,
      ...institution,
    },
    headers: {
      Authorization: createAuthorizationHeader(token),
    },
    failOnStatusCode: false,
  });
};

export const createTestInstitutionWithAllAggregators = () => {
  return createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV).then(
    (response: Cypress.Response<{ institution: { id: string } }>) => {
      const institutionId = response.body.institution.id;

      return getAggregators().then(
        (response: Cypress.Response<{ aggregators: Aggregator[] }>) => {
          const aggregatorIds = response.body.aggregators.map(({ id }) => id);

          return cy
            .wrap(
              Promise.all(
                aggregatorIds.map(
                  (aggregatorId) =>
                    new Promise((resolve) => {
                      createTestAggregatorIntegration(institutionId, {
                        aggregatorId,
                      }).then(resolve);
                    }),
                ),
              ),
            )
            .then(() => {
              return institutionId;
            });
        },
      );
    },
  );
};

export const createTestInstitutionAndAddIntegration = ({
  aggregatorId,
  aggregatorInstitutionId,
}: {
  aggregatorId: number;
  aggregatorInstitutionId?: string;
}) => {
  return createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV).then(
    (response: Cypress.Response<{ institution: { id: string } }>) => {
      const institutionId = response.body.institution.id;

      return createTestAggregatorIntegration(institutionId, {
        aggregatorId,
        aggregatorInstitutionId,
      }).then(() => {
        return institutionId;
      });
    },
  );
};
