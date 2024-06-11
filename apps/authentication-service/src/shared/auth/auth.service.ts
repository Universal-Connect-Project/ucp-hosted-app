import { TokenSet } from "auth0";
import { decode, JwtPayload } from "jsonwebtoken";

import envs from "@/config";
import { IAuthService } from "@/shared/auth/auth.model";
import { ISingleton } from "@/shared/models";

const authEndpoint = "oauth/token";

const AuthService: ISingleton<IAuthService> = (function () {
  let instance: IAuthService;

  const createInstance = (): IAuthService => {
    const domain: string = envs.AUTH0_DOMAIN;
    const audience: string = envs.AUTH0_AUDIENCE;
    const clientId: string = envs.AUTH0_CLIENT_ID;
    const clientSecret: string = envs.AUTH0_CLIENT_SECRET;

    let token: string;

    const isTokenExpired = (token: string): boolean => {
      const { exp } = decode(token, { json: true }) as JwtPayload;
      return !exp || Date.now() >= exp * 1000;
    };

    const fetchAccessToken = async (): Promise<string> => {
      const body = {
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        audience: audience,
      };

      const response: Response = await fetch(
        `https://${domain}/${authEndpoint}`,
        {
          method: "post",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        },
      );

      const data: TokenSet = (await response.json()) as TokenSet;
      token = data.access_token;
      return Promise.resolve(token);
    };

    const getAccessToken = async (): Promise<string> => {
      if (!token || isTokenExpired(token)) {
        await fetchAccessToken();
      }

      return token;
    };

    void fetchAccessToken();

    return {
      fetchAccessToken,
      getAccessToken,
      isTokenExpired,
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

export { authEndpoint };
export default AuthService;
