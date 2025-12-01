import { http, HttpResponse } from "msw";
import { server } from "../../shared/tests/testServer";
import {
  getPerformanceServiceAccessToken,
  performanceServiceM2MTokenHandler,
} from "./getPerformanceServiceAccessToken";
import { AUTH0_AUTH_TOKEN_URL } from "../../shared/tests/handlers";
import { tokenResponse } from "../../shared/tests/testData/auth0";
import { createFakeAccessToken } from "@repo/backend-utils";

describe("getPerformanceServiceAccessToken", () => {
  beforeEach(() => {
    performanceServiceM2MTokenHandler.clearLocalToken();
    performanceServiceM2MTokenHandler.clearTokenFiles();
  });

  it("retrieves a token from Auth0", async () => {
    const token = await getPerformanceServiceAccessToken();
    expect(token).toBe(tokenResponse.access_token);
  });

  it("pulls the token from cache if that's the only place it's stored", async () => {
    const expectedToken = createFakeAccessToken({
      expiresInSeconds: 120,
    });

    server.use(
      http.post(AUTH0_AUTH_TOKEN_URL, () =>
        HttpResponse.json({ ...tokenResponse, access_token: expectedToken }),
      ),
    );

    const firstToken = await getPerformanceServiceAccessToken();

    expect(firstToken).toBe(expectedToken);

    performanceServiceM2MTokenHandler.clearLocalToken();
    performanceServiceM2MTokenHandler.clearTokenFiles();

    server.use(
      http.post(AUTH0_AUTH_TOKEN_URL, () =>
        HttpResponse.json({ ...tokenResponse, access_token: "differentToken" }),
      ),
    );

    const secondToken = await getPerformanceServiceAccessToken();

    expect(secondToken).toBe(expectedToken);
  });
});
