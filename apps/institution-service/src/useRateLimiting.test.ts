import { Application } from "express";
import { useRateLimiting } from "./useRateLimiting";

describe("useRateLimiting", () => {
  beforeEach(() => {
    delete process.env.DISABLE_RATE_LIMITING;
  });

  beforeEach(() => {
    delete process.env.DISABLE_RATE_LIMITING;
  });

  it("should apply rate limiting middleware by default", () => {
    const app = {
      use: jest.fn(),
    } as unknown as Application;

    useRateLimiting(app);
    expect(app.use).toHaveBeenCalledTimes(3);
  });

  it("should not apply rate limiting if DISABLE_RATE_LIMITING is true", () => {
    process.env.DISABLE_RATE_LIMITING = "true";

    const app = {
      use: jest.fn(),
    } as unknown as Application;

    useRateLimiting(app);
    expect(app.use).not.toHaveBeenCalled();
  });
});
