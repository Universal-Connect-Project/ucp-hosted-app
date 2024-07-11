import { http, HttpResponse } from "msw";

import { User } from "@/shared/users/usersModel";
import { AUTH0_USER_BY_ID } from "@/test/handlers";
import {
  exampleClientID,
  exampleUserAlreadyHasAClientError,
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
  it("returns a user resource", async () => {
    const user: User = await getUserById(exampleUserID);
    expect(user).not.toBe(undefined);
    expect(user).toEqual(exampleUserWithClientId);
  });

  it("gets a user's id from ", async () => {
    const clientId = await getUserClientId(exampleUserID);
    expect(clientId).not.toBe(undefined);
    expect(clientId).toBe(exampleClientID);
  });

  it("returns a user's client id", async () => {
    const clientId = await getUserClientId(exampleUserID);
    expect(clientId).not.toBe(undefined);
    expect(clientId).toBe(exampleClientID);
  });

  it("sets a user's client id", async () => {
    const user = await setUserClientId(exampleUserID, exampleClientID);
    expect(user).not.toBe(undefined);
    expect(user).toEqual(exampleUserWithClientId);
  });

  it("handles an api failure", async () => {
    server.use(
      http.patch(AUTH0_USER_BY_ID, () => {
        return HttpResponse.json(exampleUserAlreadyHasAClientError);
      }),
    );

    const error = await setUserClientId(exampleUserID, exampleClientID);
    expect(error).toEqual({
      error: {
        message: "User already has a client",
      },
    });
  });
});
