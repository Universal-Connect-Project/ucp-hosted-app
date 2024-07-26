import { TokenSet } from "auth0";

import envs from "@/config";
import { ICredentialRequestBody } from "@/shared/auth/authModel";
import {
  getCachedToken,
  getIsTokenExpired,
  getLocalToken,
  setCachedToken,
  setLocalToken,
} from "@/shared/tokenUtils";

const domain: string = envs.AUTH0_DOMAIN;
const audience: string = envs.AUTH0_AUDIENCE;
const clientId: string = envs.AUTH0_CLIENT_ID;
const clientSecret: string = envs.AUTH0_CLIENT_SECRET;

const fetchAccessToken = async (): Promise<string> => {
  const body: ICredentialRequestBody = {
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    audience: audience,
  };

  const response: Response = await fetch(`https://${domain}/oauth/token`, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate using M2M Credentials");
  }

  const token: string = ((await response.json()) as TokenSet).access_token;

  if (token) {
    setCachedToken(token);
    setLocalToken(token);
  }
  return Promise.resolve(token);
};

export const getAccessToken = async (): Promise<string | undefined> => {
  let currentToken = getLocalToken();

  if (!currentToken || getIsTokenExpired(currentToken)) {
    currentToken = getCachedToken();
  }

  if (!currentToken || getIsTokenExpired(currentToken)) {
    await fetchAccessToken();
  } else {
    setLocalToken(currentToken);
  }

  return Promise.resolve(getLocalToken());
};
