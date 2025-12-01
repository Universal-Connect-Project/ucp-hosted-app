import { createM2MTokenHandler } from "@repo/backend-utils";
import { AUTH0_PERFORMANCE_SERVICE_AUDIENCE } from "@repo/shared-utils";
import { get, set } from "../../services/storageClient/redis";

const redisTokenKey = "performanceServiceM2MToken";

const setTokenInCache = async ({
  expireIn,
  token,
}: {
  expireIn: number;
  token: string;
}) => {
  await set(redisTokenKey, { token }, { ex: Math.floor(expireIn / 1000) });
};

const getTokenFromCache = async (): Promise<string | null> => {
  const { token } = ((await get(redisTokenKey, false)) || {}) as {
    token: string;
  };

  return token || null;
};

export const performanceServiceM2MTokenHandler = createM2MTokenHandler({
  audience: AUTH0_PERFORMANCE_SERVICE_AUDIENCE,
  clientId: process.env.AUTH0_PERFORMANCE_CLIENT_ID!,
  clientSecret: process.env.AUTH0_PERFORMANCE_CLIENT_SECRET!,
  domain: process.env.AUTH0_DOMAIN!,
  fileName: "performanceServiceM2MToken",
  getTokenFromCache,
  setTokenInCache,
});

export const getPerformanceServiceAccessToken =
  performanceServiceM2MTokenHandler.getToken;
