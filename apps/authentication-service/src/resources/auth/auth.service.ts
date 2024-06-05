import envs from "@/config";
import { TokenResponse } from "auth0";

type AuthService = {
  fetchServiceToken: () => Promise<void>;
  getAccessToken: () => Promise<string>;
};

type Singleton<T> = {
  getInstance: () => T;
};

// Singleton UserAuth
const Auth0Service: Singleton<AuthService> = (function () {
  let instance: AuthService;

  function createInstance(): AuthService {
    const domain: string = envs.AUTH0_DOMAIN;
    const audience: string = envs.AUTH0_AUDIENCE;
    const clientId: string = envs.AUTH0_CLIENT_ID;
    const clientSecret: string = envs.AUTH0_CLIENT_SECRET;

    let token: string;

    const fetchServiceToken = async (): Promise<void> => {
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

      const data: TokenResponse = (await response.json()) as TokenResponse;
      token = data.access_token;
    };

    const getAccessToken = async (): Promise<string> => {
      if (!token) {
        //
        await fetchServiceToken();
      }

      return token;
    };

    return {
      fetchServiceToken,
      getAccessToken,
    };
  }

  function getInstance(): AuthService {
    if (!instance) {
      instance = createInstance();
    }

    return instance;
  }

  return {
    getInstance,
  };
})();

export default Auth0Service;
