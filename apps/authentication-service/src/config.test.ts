import envs, { init } from "./config";

describe("config", () => {
  it("exports envs", () => {
    expect(envs).toBeDefined();
  });

  it("has required envs", () => {
    expect(envs.AUTH0_DOMAIN).toBeDefined();
    expect(envs.AUTH0_CLIENT_ID).toBeDefined();
    expect(envs.AUTH0_CLIENT_SECRET).toBeDefined();
  });

  it("errors if missing required envs", () => {
    const originalEnv = process.env;

    process.env = {};

    expect(() => {
      init();
    }).toThrow(
      "Missing required environment variables. Check README.md and your env files for more info.",
    );

    process.env = originalEnv;
  });
});
