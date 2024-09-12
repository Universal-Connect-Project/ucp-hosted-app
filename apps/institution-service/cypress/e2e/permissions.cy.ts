import { PORT } from "../../src/shared/const";
import {
  AGGREGATOR_USER_ACCESS_TOKEN_ENV,
  SUPER_USER_ACCESS_TOKEN_ENV,
  USER_ACCESS_TOKEN_ENV,
} from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";

describe("permissions", () => {
  it("returns a permissions object that allows creation for a super admin", () => {
    cy.request({
      url: `http://localhost:${PORT}/permissions`,
      method: "GET",
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
    }).then((response: Cypress.Response<{ canCreateInstitution: boolean }>) => {
      expect(response.status).to.eq(200);

      expect(response.body.canCreateInstitution).to.eq(true);
    });
  });

  it("returns a permissions object that allows creation for an aggregator", () => {
    cy.request({
      url: `http://localhost:${PORT}/permissions`,
      method: "GET",
      headers: {
        Authorization: createAuthorizationHeader(
          AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        ),
      },
    }).then((response: Cypress.Response<{ canCreateInstitution: boolean }>) => {
      expect(response.status).to.eq(200);

      expect(response.body.canCreateInstitution).to.eq(true);
    });
  });

  it("returns a permissions object that doesn't allow creation for a regular user", () => {
    cy.request({
      url: `http://localhost:${PORT}/permissions`,
      method: "GET",
      headers: {
        Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
      },
    }).then((response: Cypress.Response<{ canCreateInstitution: boolean }>) => {
      expect(response.status).to.eq(200);

      expect(response.body.canCreateInstitution).to.eq(false);
    });
  });
});
