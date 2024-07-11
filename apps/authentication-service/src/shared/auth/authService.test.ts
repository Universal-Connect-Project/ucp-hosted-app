import fs from "fs";
import { _testing, getAccessToken } from "./authService";
import * as authService from "./authService";
import { exampleToken } from "@/test/testData/users";

const exampleErrorString = "Error: Authentication error";

let tokenBackup: string;

beforeAll(() => {
  tokenBackup = _testing.getCachedToken() || "";
  _testing.setCachedToken(exampleToken);
});

afterAll(() => {
  _testing.setCachedToken(tokenBackup);
});

describe("authService", () => {
  describe("getAccessToken", () => {
    it("handles an error from the token endpoint", async () => {
      jest
        .spyOn(authService, "getAccessToken")
        .mockReturnValueOnce(Promise.resolve(exampleErrorString));

      const error = await getAccessToken();
      expect(error).toEqual(exampleErrorString);
    });

    it("fetches a new access token if there's no token, and sets it in the cache", async () => {
      jest.spyOn(fs, "readFileSync").mockReturnValueOnce(exampleToken);
      jest.spyOn(fs, "writeFileSync");
      jest.spyOn(authService, "getIsTokenExpired").mockReturnValueOnce(true);

      const token = await getAccessToken();

      expect(token).toEqual(exampleToken);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        _testing.tokenFile,
        exampleToken,
      );
    });

    it("fetches a new access token if the token is expired", async () => {
      const token = await getAccessToken();
      expect(token).toEqual(exampleToken);
    });

    it("returns the cached token", async () => {
      jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
      jest.spyOn(fs, "readFileSync").mockReturnValueOnce(exampleToken);
      jest.spyOn(authService, "getIsTokenExpired").mockReturnValueOnce(false);
      const token = await getAccessToken();

      expect(token).toEqual(exampleToken);
    });
  });
});
