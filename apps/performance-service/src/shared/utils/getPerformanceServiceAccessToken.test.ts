import { http, HttpResponse } from "msw";
import { server } from "../../shared/tests/testServer";
import {
  clearTokenCache,
  getPerformanceServiceAccessToken,
} from "./getPerformanceServiceAccessToken";
import { AUTH0_AUTH_TOKEN_URL } from "../../shared/tests/handlers";
import { tokenResponse } from "../../shared/tests/testData/auth0";

describe("getPerformanceServiceAccessToken", () => {
  beforeEach(() => {
    clearTokenCache();
  });

  afterEach(() => {
    clearTokenCache();
  });

  it("fetches a new access token if the cache is empty and returns a cached access token if it is still valid", async () => {
    const testToken = "testTokenForThisTest";

    server.use(
      http.post(AUTH0_AUTH_TOKEN_URL, () =>
        HttpResponse.json({
          ...tokenResponse,
          access_token: testToken,
        }),
      ),
    );

    const token = await getPerformanceServiceAccessToken();

    expect(token).toBe(testToken);

    server.use(
      http.post(AUTH0_AUTH_TOKEN_URL, () => HttpResponse.json(tokenResponse)),
    );

    const token2 = await getPerformanceServiceAccessToken();

    expect(token2).toBe(testToken);
  });

  it("fetches a new access token if the cached token has expired", async () => {
    const expiredToken = "expiredToken";

    server.use(
      http.post(AUTH0_AUTH_TOKEN_URL, () =>
        HttpResponse.json({
          ...tokenResponse,
          access_token: expiredToken,
          expires_in: 0,
        }),
      ),
    );

    const token = await getPerformanceServiceAccessToken();

    expect(token).toBe(expiredToken);

    const newToken = "newTokenAfterExpiry";

    server.use(
      http.post(AUTH0_AUTH_TOKEN_URL, () =>
        HttpResponse.json({
          ...tokenResponse,
          access_token: newToken,
        }),
      ),
    );

    const token2 = await getPerformanceServiceAccessToken();

    expect(token2).toBe(newToken);
  });

  it("throws an error if the token request fails", async () => {
    const statusText = "testStatusText";

    server.use(
      http.post(
        AUTH0_AUTH_TOKEN_URL,
        () => new HttpResponse(null, { status: 400, statusText }),
      ),
    );

    await expect(getPerformanceServiceAccessToken()).rejects.toThrow(
      `Auth0 token request failed: ${statusText}`,
    );
  });
});
