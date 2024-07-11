import { http, HttpResponse } from "msw";

import { User } from "@/shared/users/usersModel";
import { AUTH0_USER_BY_ID } from "@/test/handlers";
import {
  exampleUserAlreadyHasAClientError,
  exampleUserWithClientId,
} from "@/test/testData/users";
import { server } from "@/test/testServer";
import { getUserClientId, getUserById, setUserClientId } from "./usersService";

describe("User Service tests", () => {
  const USER_ID = "google-oauth2|115545703201865461059";
  const CLIENT_ID: string = "test-client-id";

  it("returns a user resource", async () => {
    const user: User = await getUserById(USER_ID);
    expect(user).not.toBe(undefined);
    expect(user).toEqual(exampleUserWithClientId);
  });

  it("returns a user's client id", async () => {
    const clientId = await getUserClientId(USER_ID);
    expect(clientId).not.toBe(undefined);
    expect(clientId).toBe(CLIENT_ID);
  });

  it("sets a user's client id", async () => {
    const user = await setUserClientId(USER_ID, CLIENT_ID);
    expect(user).not.toBe(undefined);
    expect(user).toEqual(exampleUserWithClientId);
  });

  it("handles an api failure", async () => {
    server.use(
      http.patch(AUTH0_USER_BY_ID, () => {
        return HttpResponse.json(exampleUserAlreadyHasAClientError);
      }),
    );

    const error = await setUserClientId(USER_ID, CLIENT_ID);
    expect(error).toEqual({
      error: {
        message: "User already has a client",
      },
    });
  });
});
