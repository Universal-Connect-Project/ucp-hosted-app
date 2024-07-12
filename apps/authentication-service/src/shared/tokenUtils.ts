import fs from "fs";
import { decode, JwtPayload } from "jsonwebtoken";
import os from "os";
import path from "path";

let token: string;
const tokenFileName: string = "brkn-arrw.txt";

export const tokenFile: string = path.join(os.tmpdir(), tokenFileName);

export const getLocalToken = (): string | undefined => {
  return token;
};

export const setLocalToken = (newToken: string): void => {
  token = newToken;
};

export const setCachedToken = (token: string): boolean => {
  try {
    fs.writeFileSync(tokenFile, token);
    setLocalToken(token);
    return true;
  } catch (Error) {
    console.log("Unable to cache token", Error);
    return false;
  }
};

export const getCachedToken = (): string | undefined => {
  if (fs.existsSync(tokenFile)) {
    const token = fs.readFileSync(tokenFile, "utf8");
    setLocalToken(token);
    return token;
  } else {
    return undefined;
  }
};

export const getIsTokenExpired = (token: string): boolean => {
  const { exp } = decode(token, { json: true }) as JwtPayload;
  return !exp || Date.now() >= exp * 1000;
};
