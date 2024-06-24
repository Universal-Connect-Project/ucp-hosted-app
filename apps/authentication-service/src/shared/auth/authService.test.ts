import { AuthService } from "./authService";

describe("Auth test", () => {
  it("returns an auth0 access token", async () => {
    const Auth = AuthService.getInstance();
    expect(Auth).not.toBeNull();

    // API token
    const token = await Auth.getAccessToken(true);
    expect(token).not.toBeNull();
    expect(Auth.isTokenExpired(token)).toBeTruthy();

    // Cached token
    const cachedToken = await Auth.getAccessToken();
    expect(cachedToken).not.toBeNull();
    expect(Auth.isTokenExpired(cachedToken)).toBeTruthy();
  });
});
