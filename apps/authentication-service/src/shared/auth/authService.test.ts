import fs from "fs";
import { http, HttpResponse } from "msw";

import * as tokenUtil from "@/shared/tokenUtils";
import { tokenFile } from "@/shared/tokenUtils";
import { AUTH0_AUTH_TOKEN } from "@/test/handlers";
import { server } from "@/test/testServer";
import { getAccessToken } from "./authService";
import { exampleCachedToken, exampleApiToken } from "@/test/testData/users";

const exampleErrorString = "Failed to authenticate using M2M Credentials";

describe("authService", () => {
  beforeAll(() => {
    jest.spyOn(tokenUtil, "getLocalToken").mockReturnValue(exampleApiToken);
    jest.spyOn(tokenUtil, "setLocalToken").mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("getAccessToken", () => {
    it("handles an error from the token endpoint", async () => {
      server.use(
        http.post(
          AUTH0_AUTH_TOKEN,
          () =>
            new HttpResponse(null, {
              status: 500,
            }),
        ),
      );
      jest.spyOn(fs, "existsSync").mockReturnValue(false);
      jest.spyOn(tokenUtil, "getLocalToken").mockReturnValue(undefined);

      await expect(getAccessToken()).rejects.toEqual(
        new Error(exampleErrorString),
      );
    });

    it("fetches a new access token if there's no token, and sets it in the cache", async () => {
      jest.spyOn(fs, "writeFileSync");
      jest.spyOn(tokenUtil, "getLocalToken").mockReturnValueOnce(undefined);
      jest.spyOn(tokenUtil, "getCachedToken").mockReturnValue(undefined);

      await getAccessToken();
      expect(fs.writeFileSync).toHaveBeenCalledWith(tokenFile, exampleApiToken);
    });

    it("fetches a new access token if the token is expired", async () => {
      jest.spyOn(fs, "writeFileSync");
      jest.spyOn(tokenUtil, "getIsTokenExpired");
      const token = await getAccessToken();

      expect(token).toEqual(exampleApiToken);
      expect(tokenUtil.getIsTokenExpired).toHaveBeenCalledWith(exampleApiToken);
      expect(fs.writeFileSync).toHaveBeenCalledWith(tokenFile, exampleApiToken);
    });

    it("returns the cached token", async () => {
      jest.spyOn(fs, "existsSync");
      jest.spyOn(fs, "readFileSync").mockReturnValueOnce(exampleCachedToken);
      jest.spyOn(tokenUtil, "getLocalToken").mockReturnValueOnce(undefined);
      jest.spyOn(tokenUtil, "getIsTokenExpired").mockReturnValueOnce(false);
      const token = await getAccessToken();

      expect(token).toEqual(exampleCachedToken);
      expect(tokenUtil.getIsTokenExpired).toHaveBeenCalledWith(
        exampleCachedToken,
      );
      expect(fs.existsSync).toHaveBeenCalledWith(tokenFile);
      expect(fs.readFileSync).toHaveBeenCalledWith(tokenFile, "utf8");
    });
  });
});
