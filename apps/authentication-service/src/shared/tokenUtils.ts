import envs from "@/config";
import { ConsoleColors } from "@/shared/enums";
import fs from "fs";
import { decode, JwtPayload } from "jsonwebtoken";
import os from "os";
import path from "path";

let token: string;
const tokenFileName: string = "brkn-arrw.txt";

export const tokenFile: string = path.join(os.tmpdir(), tokenFileName);

export const getLocalToken = (): string | undefined => {
  logToken(token);
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

export const logToken = (token: string | undefined) => {
  if (!token || process.env.JEST_WORKER_ID !== undefined) {
    return;
  }

  if (envs.ENV === "test") {
    console.log(`\nToken: ${ConsoleColors.FgGray}${token}`);
  } else if (envs.ENV === "dev") {
    console.log(
      `\nToken: ${ConsoleColors.FgGray}${token.slice(0, 10)}...${token.slice(-10)}}`,
    );
  }
};
