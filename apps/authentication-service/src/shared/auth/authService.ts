import fs from "fs";
import path from "path";
import os from "os";
import { TokenSet } from "auth0";
import { decode, JwtPayload } from "jsonwebtoken";

import envs from "@/config";
import { IAuthService, ICredentialRequestBody } from "@/shared/auth/authModel";
import { ISingleton } from "@/shared/models";

export const AuthService: ISingleton<IAuthService> = (() => {
  let instance: IAuthService;

  const createInstance = (): IAuthService => {
    const domain: string = envs.AUTH0_DOMAIN;
    const audience: string = envs.AUTH0_AUDIENCE;
    const clientId: string = envs.AUTH0_CLIENT_ID;
    const clientSecret: string = envs.AUTH0_CLIENT_SECRET;
    const tokenFileName: string = "brkn-arrw.txt";

    let token: string;
    const tokenFile: string = path.join(os.tmpdir(), tokenFileName);

    const setCachedToken = (token: string): void => {
      try {
        fs.writeFileSync(tokenFile, token);
      } catch (Error) {
        console.log("Unable to cache token", Error);
      }
    };

    const getCachedToken = (): string | undefined => {
      if (fs.existsSync(tokenFile)) {
        return fs.readFileSync(tokenFile, "utf8");
      } else {
        return undefined;
      }
    };

    const getIsTokenExpired = (token: string): boolean => {
      const { exp } = decode(token, { json: true }) as JwtPayload;
      return !exp || Date.now() >= exp * 1000;
    };

    const fetchAccessToken = async (skipCache?: boolean): Promise<string> => {
      const body: ICredentialRequestBody = {
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        audience: audience,
      };

      const _token = skipCache ? undefined : getCachedToken();

      if (_token && !getIsTokenExpired(_token)) {
        token = _token;
        return Promise.resolve(token);
      }

      try {
        const response: Response = await fetch(
          `https://${domain}/oauth/token`,
          {
            method: "post",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
          },
        );

        token = ((await response.json()) as TokenSet).access_token;

        setCachedToken(token);
        return Promise.resolve(token);
      } catch (error) {
        return Promise.reject(error);
      }
    };

    const getAccessToken = async (skipCache?: boolean): Promise<string> => {
      if (!token || getIsTokenExpired(token)) {
        await fetchAccessToken(skipCache);
      }

      return Promise.resolve(token);
    };

    return {
      fetchAccessToken,
      getAccessToken,
      isTokenExpired: getIsTokenExpired,
    };
  };

  const getInstance = (): IAuthService => {
    if (!instance) {
      instance = createInstance();
    }

    return instance;
  };

  return {
    getInstance,
  };
})();
