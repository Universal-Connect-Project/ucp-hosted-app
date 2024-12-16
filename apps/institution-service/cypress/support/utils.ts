import { PORT } from "shared/const";
import { InstitutionAttrs, testInstitution } from "test/testData/institutions";
import { createAuthorizationHeader } from "../shared/utils/authorization";

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

export const checkIsSorted = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arr: Record<string, any>[],
  prop: string,
  direction: "asc" | "desc",
) => {
  for (let i = 1; i < arr.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const a = arr[i - 1][prop];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const b = arr[i][prop];

    if (direction === "asc") {
      if (a > b) return false;
    } else {
      if (a < b) return false;
    }
  }

  return true;
};
