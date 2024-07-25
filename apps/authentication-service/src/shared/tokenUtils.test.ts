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
  });

  describe("setCachedToken", () => {
    it("sets token", () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
      jest.spyOn(fs, "readFileSync").mockReturnValue(validTestToken);
      setCachedToken(validTestToken);
      expect(getCachedToken()).toBe(validTestToken);
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
    // jest.mock("dotenv", () => ({ config: jest.fn() }), { virtual: true });
    // const OLD_ENV = process.env;

    // afterEach(() => {
    //   process.env = { ...OLD_ENV };
    // });

    it("logs token with ENV=test", () => {
      jest.spyOn(console, "log").mockImplementation(() => {});
      process.env.JEST_NO_SKIP = "true";
      process.env.ENV = "test";

      logToken(validTestToken);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(validTestToken),
      );
    });

    it("logs token with ENV=dev", () => {
      jest.spyOn(console, "log").mockImplementation(() => {});
      process.env.JEST_NO_SKIP = "true";
      process.env.ENV = "dev";

      logToken(validTestToken);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(`${validTestToken.slice(0, 10)}...`),
      );
    });
  });
});
