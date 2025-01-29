export const createAuthorizationHeader = (cypressEnv: string) =>
  `Bearer ${Cypress.env(cypressEnv)}`;

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
