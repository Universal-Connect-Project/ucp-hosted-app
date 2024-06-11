import AuthService from "./auth.service";

describe("Auth test", () => {
  it("tests Auth0 token request", async () => {
    const Auth = AuthService.getInstance();
    const token = await Auth.getAccessToken();

    expect(token).not.toBeNull();
    expect(Auth.isTokenExpired(token)).toBeTruthy();
  });
});
