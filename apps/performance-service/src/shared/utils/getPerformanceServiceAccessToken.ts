import { AUTH0_PERFORMANCE_SERVICE_AUDIENCE } from "@repo/shared-utils";

let tokenCache: { token: string; expiresAt: number } | null = null;

export const clearTokenCache = () => {
  tokenCache = null;
};

export const getPerformanceServiceAccessToken = async (): Promise<string> => {
  const now = Date.now();

  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  const response = await fetch(
    `https://${process.env.AUTH0_DOMAIN!}/oauth/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.AUTH0_PERFORMANCE_CLIENT_ID!,
        client_secret: process.env.AUTH0_PERFORMANCE_CLIENT_SECRET!,
        audience: AUTH0_PERFORMANCE_SERVICE_AUDIENCE,
        grant_type: "client_credentials",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Auth0 token request failed: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };
  const expiresInMs = data.expires_in * 1000;

  tokenCache = {
    token: data.access_token,
    expiresAt: now + expiresInMs - 5000, // Refresh 5s before expiry
  };

  return data.access_token;
};
