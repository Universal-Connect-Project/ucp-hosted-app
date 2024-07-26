import { getTestToken } from "@/test/testData/users";
import fs from "fs";

import {
  getCachedToken,
  getIsTokenExpired,
  getLocalToken,
  setCachedToken,
  setLocalToken,
  tokenFile,
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
    it("sets token to the cache file", () => {
      const testToken = "setCachedTokenTestToken";
      jest.spyOn(fs, "writeFileSync");
      setCachedToken(testToken);
      expect(fs.writeFileSync).toHaveBeenCalledWith(tokenFile, testToken);
    });
  });

  describe("getCachedToken", () => {
    it("returns undefined if there is no file", () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(false);
      expect(getCachedToken()).toBeUndefined();
    });

    it("returns the token from the file if there is one", () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      jest.spyOn(fs, "readFileSync").mockReturnValue("tokenJustForThisTest");
      expect(getCachedToken()).toBe("tokenJustForThisTest");
    });
  });

  describe("getLocalToken", () => {
    it("returns token in local cache", () => {
      setLocalToken("localTestToken");
      expect(getLocalToken()).toBe("localTestToken");
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
});
