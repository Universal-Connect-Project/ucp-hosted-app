import envs, { init } from "./config";
process.env.DOTENV_CONFIG_PATH = "./testData/.env.error";

describe("config", () => {
  it("exports envs", () => {
    expect(envs).toBeDefined();
  });

  it("has required envs", () => {
    expect(envs.PORT).toBeDefined();
    expect(envs.ENV).toBeDefined();
    expect(envs.CLIENT_ORIGIN_URL).toBeDefined();
    expect(envs.AUTH0_AUDIENCE).toBeDefined();
    expect(envs.AUTH0_DOMAIN).toBeDefined();
    expect(envs.AUTH0_CLIENT_ID).toBeDefined();
    expect(envs.AUTH0_CLIENT_SECRET).toBeDefined();
  });

  it("errors if missing required envs", () => {
    expect(() => {
      init("./src/test/testData/.env.error");
    }).toThrow(
      "Missing required environment variables. Check README.md and `../.env.example` for more info.",
    );
  });

  it("errors if unable to load file", () => {
    expect(() => {
      init(".env.error");
    }).toThrow("ENOENT: no such file or directory, open '.env.error'");
  });
});
