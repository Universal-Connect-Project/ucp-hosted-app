import fs from "fs";
import { beforeEach, describe, it } from "vitest";
import { createM2MTokenHandler, tokenStorageFolderPath } from "./m2mToken";
import { m2mAccessTokenResponse } from "./test/testData/m2mAccessToken";
import { server } from "./test/testServer";
import { http, HttpResponse } from "msw";
import { FETCH_ACCESS_TOKEN_URL } from "./test/handlers";
import { createFakeAccessToken } from "./test/createFakeAccessToken";

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
      if (!tokenData.expireIn) {
        throw new Error("expireIn is required to set token in cache");
      }

      cacheObject["token"] = tokenData.token;
    };

    const clearCache = () => {
      cacheObject = {};
    };

    let m2mTokenHandler: {
      clearLocalToken: () => void;
      getLocalToken: () => string | null;
      getToken: () => Promise<string | null>;
      tokenFilePath: string;
    };

    const clearTokenFiles = () => {
      if (fs.existsSync(tokenStorageFolderPath)) {
        fs.rmSync(tokenStorageFolderPath, { recursive: true, force: true });
      }
    };

    let validAccessToken: string;

    const prepareTokenSuccess = () => {
      validAccessToken = createFakeAccessToken({ expiresInSeconds: 120 });

      server.use(
        http.post(FETCH_ACCESS_TOKEN_URL, () =>
          HttpResponse.json({
            access_token: validAccessToken,
            expires_in: 86400,
          }),
        ),
      );
    };

    const prepareDifferentToken = () => {
      server.use(
        http.post(FETCH_ACCESS_TOKEN_URL, () =>
          HttpResponse.json({
            access_token: "junkToken",
            expires_in: 86400,
          }),
        ),
      );
    };

    beforeEach(async () => {
      m2mTokenHandler = createM2MTokenHandler({
        audience: "https://api.example.com",
        domain: "example-domain",
        clientId: "your-client-id",
        clientSecret: "your-client-secret",
        fileName: "test-token",
        getTokenFromCache,
        setTokenInCache,
      });

      clearTokenFiles();

      clearCache();
    });

    it("should fetch a new token if the first one is junk", async () => {
      const junkAccessToken = "junkToken";

      server.use(
        http.post(FETCH_ACCESS_TOKEN_URL, () =>
          HttpResponse.json({
            access_token: junkAccessToken,
            expires_in: 86400,
          }),
        ),
      );

      const firstToken = await m2mTokenHandler.getToken();

      expect(firstToken).toBe(junkAccessToken);

      prepareTokenSuccess();

      const secondToken = await m2mTokenHandler.getToken();

      expect(secondToken).toBe(validAccessToken);
    });

    it("should fetch a new token when no token is available and store it in a local variable, a cache, and a file", async () => {
      expect(fs.existsSync(m2mTokenHandler.tokenFilePath)).toBe(false);
      expect(await getTokenFromCache()).toBeNull();

      expect(m2mTokenHandler.getLocalToken()).toBeNull();

      const token = await m2mTokenHandler.getToken();

      expect(token).toBe(m2mAccessTokenResponse.access_token);

      const file = fs.readFileSync(m2mTokenHandler.tokenFilePath, "utf-8");

      expect(file).toEqual(m2mAccessTokenResponse.access_token);

      expect(await getTokenFromCache()).toEqual(
        m2mAccessTokenResponse.access_token,
      );
    });

    it("should fetch a new token if the local token will expire in less than 60 seconds", async () => {
      const expiredAccessToken = createFakeAccessToken({
        expiresInSeconds: 59,
      });

      server.use(
        http.post(FETCH_ACCESS_TOKEN_URL, () =>
          HttpResponse.json({
            access_token: expiredAccessToken,
            expires_in: 59,
          }),
        ),
      );

      const firstToken = await m2mTokenHandler.getToken();

      expect(firstToken).toBe(expiredAccessToken);

      const validAccessToken = createFakeAccessToken({ expiresInSeconds: 120 });

      server.use(
        http.post(FETCH_ACCESS_TOKEN_URL, () =>
          HttpResponse.json({
            access_token: validAccessToken,
            expires_in: 86400,
          }),
        ),
      );

      const secondToken = await m2mTokenHandler.getToken();

      expect(secondToken).toBe(validAccessToken);
    });

    it("should return the local token if it is available and not expired", async () => {
      prepareTokenSuccess();

      const firstToken = await m2mTokenHandler.getToken();

      expect(firstToken).toBe(validAccessToken);

      clearTokenFiles();
      clearCache();

      prepareDifferentToken();

      const secondToken = await m2mTokenHandler.getToken();

      expect(secondToken).toBe(validAccessToken);
    });

    it("should returns the cached token if it is available and not expired", async () => {
      prepareTokenSuccess();

      const firstToken = await m2mTokenHandler.getToken();
      expect(firstToken).toBe(validAccessToken);

      m2mTokenHandler.clearLocalToken();
      clearTokenFiles();

      prepareDifferentToken();

      const secondToken = await m2mTokenHandler.getToken();
      expect(secondToken).toBe(validAccessToken);
    });

    it("should return the file token if it is available and not expired", async () => {
      prepareTokenSuccess();

      const firstToken = await m2mTokenHandler.getToken();

      expect(firstToken).toBe(validAccessToken);

      m2mTokenHandler.clearLocalToken();
      clearCache();

      prepareDifferentToken();

      const secondToken = await m2mTokenHandler.getToken();

      expect(secondToken).toBe(validAccessToken);
    });
  });
});
