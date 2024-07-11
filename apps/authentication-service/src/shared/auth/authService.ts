import fs from "fs";
import path from "path";
import os from "os";
import { TokenSet } from "auth0";
import { decode, JwtPayload } from "jsonwebtoken";

import envs from "@/config";
import { ICredentialRequestBody } from "@/shared/auth/authModel";

const domain: string = envs.AUTH0_DOMAIN;
const audience: string = envs.AUTH0_AUDIENCE;
const clientId: string = envs.AUTH0_CLIENT_ID;
const clientSecret: string = envs.AUTH0_CLIENT_SECRET;
const tokenFileName: string = "brkn-arrw.txt";

let token: string;

const tokenFile: string = path.join(os.tmpdir(), tokenFileName);

const setCachedToken = (token: string): boolean => {
  try {
    fs.writeFileSync(tokenFile, token);
    return true;
  } catch (Error) {
    console.log("Unable to cache token", Error);
    return false;
  }
};

const getCachedToken = (): string | undefined => {
  if (fs.existsSync(tokenFile)) {
    token = fs.readFileSync(tokenFile, "utf8");
    return token;
  } else {
    return undefined;
  }
};

const fetchAccessToken = async (): Promise<string> => {
  const body: ICredentialRequestBody = {
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    audience: audience,
  };

  try {
    const response: Response = await fetch(`https://${domain}/oauth/token`, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    token = ((await response.json()) as TokenSet).access_token;

    token && setCachedToken(token);
    return Promise.resolve(token);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getIsTokenExpired = (token: string): boolean => {
  const { exp } = decode(token, { json: true }) as JwtPayload;
  return !exp || Date.now() >= exp * 1000;
};

export const getAccessToken = async (): Promise<string> => {
  const currentToken = token || getCachedToken();

  if (!currentToken || getIsTokenExpired(currentToken)) {
    await fetchAccessToken();
  }

  return Promise.resolve(token);
};

export const _testing = {
  tokenFile,
  setCachedToken,
  getCachedToken,
};
