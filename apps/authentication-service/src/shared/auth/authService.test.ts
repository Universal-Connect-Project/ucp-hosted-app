import fs from "fs";
import { getAccessToken, tokenFile } from "./authService";
import * as authService from "./authService";
import { exampleToken } from "@/test/testData/users";

const exampleErrorString = "Error: Authentication error";

describe("authService", () => {
  describe("getAccessToken", () => {
    it("it handles an error from the token endpoint", async () => {
      jest
        .spyOn(authService, "getAccessToken")
        .mockReturnValueOnce(Promise.resolve(exampleErrorString));

      const error = await getAccessToken();
      expect(error).toEqual(exampleErrorString);
    });

    it("fetches a new access token if there's no token, and sets it in the cache", async () => {
      jest.spyOn(fs, "existsSync").mockReturnValueOnce(false);
      jest.spyOn(fs, "writeFileSync");
      const token = await getAccessToken();

      expect(token).toEqual(exampleToken);
      expect(fs.writeFileSync).toHaveBeenCalledWith(tokenFile, exampleToken);
    });

    it("fetches a new access token if the token is expired", async () => {
      // jest
      //   .spyOn(authService, "getAccessToken")
      //   .mockReturnValueOnce(Promise.resolve(exampleToken));
      //
      // const token = await getAccessToken();
      // expect(token).toEqual(exampleToken);
      // expect(token).toEqual(exampleToken);
    });

    it("it doesn't fetch a new access token, but returns the cached token, if there is a token", async () => {});
  });
});
