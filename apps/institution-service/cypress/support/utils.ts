import { InstitutionAttrs } from "../../src/test/testData/institutions";
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
