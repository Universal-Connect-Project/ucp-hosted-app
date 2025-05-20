import { PORT } from "../../src/shared/const";
import {
  InstitutionAttrs,
  testInstitution,
} from "../../src/test/testData/institutions";
import { createAuthorizationHeader } from "../shared/utils/authorization";
import { SUPER_USER_ACCESS_TOKEN_ENV } from "../shared/constants/accessTokens";
import { getAggregators } from "../shared/utils/requests";
import { Aggregator } from "models/aggregator";

interface runTokenInvalidCheckArgs {
  url: string;
  method: string;
}

export const runTokenInvalidCheck = (args: runTokenInvalidCheckArgs) => {
  const { url, method } = args;

  it("gets 401 when token is invalid", () => {
    cy.request({
      url,
      failOnStatusCode: false,
      method,
      headers: {
        Authorization: "Bearer junk",
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(401);
    });
  });
};

interface runInvalidPermissionCheckArgs {
  url: string;
  token_env_var: string;
  method: string;
  body?: InstitutionAttrs;
}

export const runInvalidPermissionCheck = (
  args: runInvalidPermissionCheckArgs,
) => {
  it("gets 403 when token doesnt have permission", () => {
    const { url, token_env_var, method, body } = args;

    cy.request({
      url,
      failOnStatusCode: false,
      method,
      body,
      headers: {
        Authorization: createAuthorizationHeader(token_env_var),
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(403);
    });
  });
};

export const deleteAggregatorIntegration = ({
  aggregatorIntegrationId,
  token,
}: {
  aggregatorIntegrationId: number;
  token: string;
}) => {
  return cy.request({
    url: `http://localhost:${PORT}/aggregatorIntegrations/${aggregatorIntegrationId}`,
    method: "DELETE",
    headers: {
      Authorization: createAuthorizationHeader(token),
    },
    failOnStatusCode: false,
  });
};

export const createTestInstitution = (token: string) => {
  return cy.request({
    url: `http://localhost:${PORT}/institutions`,
    method: "POST",
    body: {
      ...testInstitution,
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

export const createTestAggregatorIntegration = (
  institutionId: string,
  { aggregatorId, ...aggregatorIntegrationProps }: { aggregatorId: number },
) => {
  return cy.request({
    url: `http://localhost:${PORT}/aggregatorIntegrations`,
    method: "POST",
    headers: {
      Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
    },
    body: {
      institution_id: institutionId,
      aggregatorId,
      aggregator_institution_id: "test_cypress",
      supports_oauth: true,
      ...aggregatorIntegrationProps,
    },
  });
};

export const createTestInstitutionAndAddIntegration = (
  aggregatorId: number,
) => {
  return createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV).then(
    (response: Cypress.Response<{ institution: { id: string } }>) => {
      const institutionId = response.body.institution.id;

      return createTestAggregatorIntegration(institutionId, {
        aggregatorId,
      }).then(() => {
        return institutionId;
      });
    },
  );
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
