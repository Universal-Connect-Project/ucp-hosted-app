export const createAuthorizationHeader = (cypressEnv: string) =>
  `Bearer ${Cypress.env(cypressEnv)}`;
