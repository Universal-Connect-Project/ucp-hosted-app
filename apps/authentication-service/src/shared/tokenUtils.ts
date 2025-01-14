import fs from "fs";
import { decode, JwtPayload } from "jsonwebtoken";
import os from "os";
import path from "path";

let token: string | undefined;
const tokenFileName: string = `${process.env.PRODUCTION === "true" ? "prod" : "staging"}authenticationServiceToken.txt`;

export const tokenFile: string = path.join(os.tmpdir(), tokenFileName);

export const getLocalToken = (): string | undefined => {
  return token;
};

export const setLocalToken = (newToken: string | undefined): void => {
  token = newToken;
};

export const setCachedToken = (token: string): boolean => {
  fs.writeFileSync(tokenFile, token);
  return true;
};

export const getCachedToken = (): string | undefined => {
  if (fs.existsSync(tokenFile)) {
    return fs.readFileSync(tokenFile, "utf8");
  }
  return undefined;
};

export const getIsTokenExpired = (
  token: string | undefined | null,
): boolean => {
  if (!token) {
    return true;
  }

  try {
    const { exp } = decode(token, { json: true }) as JwtPayload;
    return !exp || Date.now() >= exp * 1000;
  } catch (Error) {
    return true;
  }
};
