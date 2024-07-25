import fs from "fs";
import { decode, JwtPayload } from "jsonwebtoken";
import os from "os";
import path from "path";

import { ConsoleColors } from "@/shared/enums";

let token: string | undefined;
const tokenFileName: string = "brkn-arrw.txt";

export const tokenFile: string = path.join(os.tmpdir(), tokenFileName);

export const getLocalToken = (): string | undefined => {
  logToken(token);
  return token;
};

export const setLocalToken = (newToken: string | undefined): void => {
  token = newToken;
};

export const setCachedToken = (token: string): boolean => {
  try {
    fs.writeFileSync(tokenFile, token);
    return true;
  } catch (Error) {
    console.log("Unable to cache token", Error);
    return false;
  }
};

export const getCachedToken = (): string | undefined => {
  if (fs.existsSync(tokenFile)) {
    return fs.readFileSync(tokenFile, "utf8");
  } else {
    return undefined;
  }
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

export const logToken = (token: string | undefined) => {
  if (
    !token ||
    (process.env.JEST_WORKER_ID !== undefined && !process.env.JEST_NO_SKIP)
  ) {
    return;
  }

  if (process.env.ENV === "test") {
    console.log(`\nToken: ${ConsoleColors.FgGray}${token}`);
  } else if (process.env.ENV === "dev") {
    console.log(
      `\nToken: ${ConsoleColors.FgGray}${token.slice(0, 10)}...${token.slice(-10)}}`,
    );
  }
};
