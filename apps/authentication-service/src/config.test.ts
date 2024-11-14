import envs, { init } from "./config";

describe("config", () => {
  it("exports envs", () => {
    expect(envs).toBeDefined();
  });

  it("has required envs", () => {
    expect(envs.AUTH0_M2M_AUDIENCE).toBeDefined();
    expect(envs.AUTH0_DOMAIN).toBeDefined();
    expect(envs.AUTH0_CLIENT_ID).toBeDefined();
    expect(envs.AUTH0_CLIENT_SECRET).toBeDefined();
  });

  it("errors if missing required envs", () => {
    expect(() => {
      init({
        authM2mAudience: undefined,
        auth0Domain: undefined,
        auth0ClientId: undefined,
        auth0ClientSecret: undefined,
      });
    }).toThrow(
      "Missing required environment variables. Check README.md and `../.env.example` for more info.",
    );
  });
});
