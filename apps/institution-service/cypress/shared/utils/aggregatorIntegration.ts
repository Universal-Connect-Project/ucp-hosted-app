import { PORT } from "../../../src/shared/const";
import { createAuthorizationHeader } from "./authorization";
import { SUPER_USER_ACCESS_TOKEN_ENV } from "../constants/accessTokens";

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

export const createTestAggregatorIntegration = (
  institutionId: string,
  {
    aggregatorId,
    aggregatorInstitutionId,
    isActive,
  }: {
    aggregatorId: number;
    aggregatorInstitutionId?: string;
    isActive?: boolean;
  },
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
      aggregator_institution_id: aggregatorInstitutionId || "testCypress",
      supports_oauth: true,
      isActive,
    },
  });
};
