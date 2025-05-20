import { PORT } from "shared/const";
import { createAuthorizationHeader } from "./authorization";

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
