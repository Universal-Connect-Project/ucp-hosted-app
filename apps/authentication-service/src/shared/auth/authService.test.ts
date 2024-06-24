import { getAccessToken, getIsTokenExpired } from "./authService";

describe("Auth test", () => {
  it("returns an auth0 access token", async () => {
    // API token
    const token = await getAccessToken(true);
    expect(token).not.toBeNull();
    expect(getIsTokenExpired(token)).toBeTruthy();

    // Cached token
    const cachedToken = await getAccessToken();
    expect(cachedToken).not.toBeNull();
    expect(!getIsTokenExpired(cachedToken)).toBeTruthy();
  });
});
