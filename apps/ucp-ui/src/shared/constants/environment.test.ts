describe("Environment based urls", () => {
  beforeEach(() => {
    delete process.env.UCP_UI_REVIEW_APP;
    delete process.env.HEROKU_APP_NAME;
    delete process.env.INSTITUTION_SERVICE_BASE_URL;
    delete process.env.AUTHENTICATION_SERVICE_BASE_URL;

    jest.resetModules();
  });

  it("should return the review app URL for institution service if UCP_UI_REVIEW_APP is set", async () => {
    process.env.UCP_UI_REVIEW_APP = "true";
    process.env.HEROKU_APP_NAME = "my-review-app";

    const { INSTITUTION_SERVICE_BASE_URL } = await import("./environment");
    const expectedUrl = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/institution-service`;
    expect(INSTITUTION_SERVICE_BASE_URL).toBe(expectedUrl);
  });

  it("should return the fallback URL for institution service if UCP_UI_REVIEW_APP is not set", async () => {
    process.env.INSTITUTION_SERVICE_BASE_URL = "http://custom-url.com";

    const { INSTITUTION_SERVICE_BASE_URL } = await import("./environment");
    expect(INSTITUTION_SERVICE_BASE_URL).toBe("http://custom-url.com");
  });

  it("should return the default localhost URL for institution service if no environment variables are set", async () => {
    const { INSTITUTION_SERVICE_BASE_URL } = await import("./environment");
    expect(INSTITUTION_SERVICE_BASE_URL).toBe("http://localhost:8088");
  });

  it("should return the review app URL for authentication service if UCP_UI_REVIEW_APP is set", async () => {
    process.env.UCP_UI_REVIEW_APP = "true";
    process.env.HEROKU_APP_NAME = "my-review-app";

    const { AUTHENTICATION_SERVICE_BASE_URL } = await import("./environment");
    const expectedUrl = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/authentication-service`;
    expect(AUTHENTICATION_SERVICE_BASE_URL).toBe(expectedUrl);
  });

  it("should return the fallback URL for authentication service if UCP_UI_REVIEW_APP is not set", async () => {
    process.env.AUTHENTICATION_SERVICE_BASE_URL = "http://custom-auth-url.com";

    const { AUTHENTICATION_SERVICE_BASE_URL } = await import("./environment");
    expect(AUTHENTICATION_SERVICE_BASE_URL).toBe("http://custom-auth-url.com");
  });

  it("should return the default localhost URL for authentication service if no environment variables are set", async () => {
    const { AUTHENTICATION_SERVICE_BASE_URL } = await import("./environment");
    expect(AUTHENTICATION_SERVICE_BASE_URL).toBe("http://localhost:8089");
  });
});
