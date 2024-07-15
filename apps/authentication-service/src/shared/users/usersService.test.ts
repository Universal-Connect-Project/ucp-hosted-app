import { http, HttpResponse } from "msw";

import { User } from "@/shared/users/usersModel";
import { AUTH0_USER_BY_ID } from "@/test/handlers";
import {
  exampleClientID,
  exampleUserID,
  exampleUserInfoResponse,
  exampleUserWithClientId,
} from "@/test/testData/users";
import { server } from "@/test/testServer";
import { getUserClientId, getUserById, setUserClientId } from "./usersService";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("auth0", () => ({
  ...jest.requireActual("auth0"),
  UserInfoClient: class {
    getUserInfo = (_token: string) => ({ data: exampleUserInfoResponse });
  },
}));

describe("User Service tests", () => {
  describe("getUserById", () => {
    it("returns a user resource", async () => {
      const user: User = await getUserById(exampleUserID);
      expect(user).toEqual(exampleUserWithClientId);
    });
  });

  describe("getUserClientId", () => {
    it("gets the client id from a user resource", async () => {
      const clientId = await getUserClientId(exampleUserID);
      expect(clientId).toBe(exampleClientID);
    });
  });

  describe("setUserClientId", () => {
    it("sets a user's client id", async () => {
      const user = await setUserClientId(exampleUserID, exampleClientID);
      expect(user).toEqual(exampleUserWithClientId);
    });
  });

  describe("setUserClientId errors", () => {
    it("handles an api failure", async () => {
      server.use(
        http.patch(AUTH0_USER_BY_ID, () => {
          return new HttpResponse(null, {
            status: 500,
          });
        }),
      );

      await expect(
        setUserClientId(exampleUserID, exampleClientID),
      ).rejects.toEqual(new Error("Internal Server Error"));
    });
  });
});
