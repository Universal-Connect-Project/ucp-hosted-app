import AuthService from "@/shared/auth/auth.service";

describe("Auth test", () => {
  it("tests Auth0 token request", async () => {
    const Auth = AuthService.getInstance();
    expect(Auth).not.toBeNull();

    const token = await Auth.getAccessToken();
    expect(token).not.toBeNull();
    expect(Auth.isTokenExpired(token)).toBeTruthy();
  });
});
