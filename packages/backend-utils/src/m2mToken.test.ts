import { beforeEach, describe, it } from "vitest";
import { createM2MTokenHandler } from "./m2mToken";

describe("m2mToken", () => {
  describe("createM2MTokenHandler", () => {
    let cacheObject: Record<string, string> = {};

    const getTokenFromCache = async (): Promise<string | null> => {
      return cacheObject["token"] || null;
    };

    const setTokenInCache = async (tokenData: {
      expireIn: number;
      token: string;
    }) => {
      cacheObject["token"] = tokenData.token;
    };

    let m2mTokenHandler: {
      getToken: () => Promise<string | null>;
      clearLocalToken: () => void;
    };

    beforeEach(() => {
      m2mTokenHandler = createM2MTokenHandler({
        audience: "https://api.example.com",
        domain: "example-domain",
        clientId: "your-client-id",
        clientSecret: "your-client-secret",
        fileName: "test-token",
        getTokenFromCache,
        setTokenInCache,
      });
    });

    it("should fetch a new token when no valid token is available and store it in a local variable, a cache, and a file", async () => {
      const token = await m2mTokenHandler.getToken();
    });
  });
});
