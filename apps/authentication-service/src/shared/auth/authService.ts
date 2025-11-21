import { createM2MTokenHandler } from "@repo/backend-utils";
import envs from "../../config";

const tokenDomain: string = envs.AUTH0_TOKEN_DOMAIN;
const audience: string = `https://${tokenDomain}/api/v2/`;
const clientId: string = envs.AUTH0_CLIENT_ID;
const clientSecret: string = envs.AUTH0_CLIENT_SECRET;

const m2mTokenHandler = createM2MTokenHandler({
  audience,
  clientId,
  clientSecret,
  domain: tokenDomain,
  fileName: "auth0ManagementApiToken",
});

export const getAccessToken = m2mTokenHandler.getToken;
