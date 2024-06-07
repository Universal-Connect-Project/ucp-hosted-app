import { TokenSet } from "auth0";
import { decode, JwtPayload } from "jsonwebtoken";

import envs from "@/config";
import { AuthService } from "@/resources/auth/auth.model";
import { Singleton } from "@/shared/models";

const Auth: Singleton<AuthService> = (function () {
  let instance: AuthService;

  const createInstance = (): AuthService => {
    const domain: string = envs.AUTH0_DOMAIN;
    const audience: string = envs.AUTH0_AUDIENCE;
    const clientId: string = envs.AUTH0_CLIENT_ID;
    const clientSecret: string = envs.AUTH0_CLIENT_SECRET;

    let token: string;
    // let refreshPromise: Promise<any> | null = null;

    // const refreshToken = () => {
    //   if (!refreshPromise) {
    //     // start a refresh request only if one isn't in flight
    //     refreshPromise = axios(...).then((res) => {
    //       // ... reset token
    //       refreshPromise = null;
    //     });
    //   }
    //   return refreshPromise;
    // };

    const isTokenExpired = (token: string): boolean => {
      const { exp } = decode(token, { json: true }) as JwtPayload;
      return !exp || Date.now() >= exp * 1000;
    };

    const fetchAccessToken = async (): Promise<void> => {
      const body = {
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

      const data: TokenSet = (await response.json()) as TokenSet;
      token = data.access_token;
    };

    const getAccessToken = async (): Promise<string> => {
      if (!token) {
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

  const getInstance = (): AuthService => {
    if (!instance) {
      instance = createInstance();
    }

    return instance;
  };

  return {
    getInstance,
  };
})();

export default Auth;
