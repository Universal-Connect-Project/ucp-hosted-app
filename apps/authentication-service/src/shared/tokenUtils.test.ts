import { getTestToken } from "@/test/testData/users";
import fs from "fs";

import {
  getCachedToken,
  getIsTokenExpired,
  getLocalToken,
  logToken,
  setCachedToken,
  setLocalToken,
} from "@/shared/tokenUtils";

let tokenBackup: string;
const validTestToken: string = getTestToken();
const expiredTestToken: string = getTestToken(true);

describe("tokenUtils", () => {
  beforeAll(() => {
    tokenBackup = getCachedToken() || "";
  });

  afterAll(() => {
    if (tokenBackup) {
      setCachedToken(tokenBackup);
    }
    jest.clearAllMocks();
  });

  describe("setCachedToken", () => {
    it("sets token", () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
      jest.spyOn(fs, "readFileSync").mockReturnValue(validTestToken);
      setCachedToken(validTestToken);
      expect(getCachedToken()).toBe(validTestToken);
    });

    it("throws an error when unable to cache token", () => {
      jest.spyOn(fs, "writeFileSync").mockImplementation(() => {
        throw new Error();
      });

      const result = setCachedToken(validTestToken);
      expect(result).toBe(false);
    });
  });

  describe("getCachedToken", () => {
    it("returns undefined", () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(false);
      expect(getCachedToken()).toBeUndefined();
    });

    it("returns token", () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      jest.spyOn(fs, "readFileSync").mockReturnValue(validTestToken);
      expect(getCachedToken()).toBe(validTestToken);
    });
  });

  describe("getLocalToken", () => {
    it("returns undefined", () => {
      setLocalToken(undefined);
      expect(getLocalToken()).toBeUndefined();
    });

    it("returns token", () => {
      setLocalToken(validTestToken);
      expect(getLocalToken()).toBe(validTestToken);
    });
  });

  describe("setLocalToken", () => {
    it("sets token", () => {
      setLocalToken(validTestToken);
      expect(getLocalToken()).toBe(validTestToken);
    });
  });

  describe("getIsTokenExpired", () => {
    it("returns true if token is not a valid token", () => {
      expect(getIsTokenExpired("token")).toBe(true);
    });

    it("returns true if token is null", () => {
      expect(getIsTokenExpired(null)).toBe(true);
    });

    it("returns true if token is undefined", () => {
      expect(getIsTokenExpired(undefined)).toBe(true);
    });

    it("returns false if token is not expired", () => {
      expect(getIsTokenExpired(validTestToken)).toBe(false);
    });

    it("returns true if token is expired", () => {
      expect(getIsTokenExpired(expiredTestToken)).toBe(true);
    });
  });

  describe("logToken", () => {
    jest.spyOn(console, "log").mockImplementation(() => {});

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("logs token with ENV=test", () => {
      process.env.JEST_NO_SKIP = "true";
      process.env.ENV = "test";

      logToken(validTestToken);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(validTestToken),
      );
    });

    it("logs token with ENV=dev", () => {
      process.env.JEST_NO_SKIP = "true";
      process.env.ENV = "dev";

      logToken(validTestToken);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(`${validTestToken.slice(0, 10)}...`),
      );
    });

    it("does not log token with ENV=prod", () => {
      process.env.JEST_NO_SKIP = "true";
      process.env.ENV = "prod";

      logToken(validTestToken);
      expect(console.log).not.toHaveBeenCalled();
    });

    it("does not log token with undefined token", () => {
      process.env.JEST_NO_SKIP = "true";

      logToken(undefined);
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
