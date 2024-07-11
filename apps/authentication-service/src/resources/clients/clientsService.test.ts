import { getUserClientId } from "@/shared/users/usersService";
import { Client } from "auth0";
import { http, HttpResponse } from "msw";

import { AUTH0_USER_BY_ID } from "@/test/handlers";
import {
  exampleUser,
  exampleToken,
  exampleUserAlreadyHasAClientResponseError,
  exampleUserInfoResponse,
  exampleUserID,
} from "@/test/testData/users";
import { server } from "@/test/testServer";
import {
  exampleClient,
  exampleClientDesc,
  exampleClientName,
} from "@/test/testData/clients";
import { getClient, createClient, deleteClient } from "./clientsService";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("auth0", () => ({
  ...jest.requireActual("auth0"),
  UserInfoClient: class {
    getUserInfo = (_token: string) => ({ data: exampleUserInfoResponse });
  },
}));

describe("Clients test", () => {
  it("creates a new client", async () => {
    server.use(
      http.get(AUTH0_USER_BY_ID, () => HttpResponse.json(exampleUser)),
    );
    const client: Client = await createClient(exampleToken, {
      name: exampleClientName,
      description: exampleClientDesc,
    });

    expect(client).not.toBe(undefined);
    expect(client).toEqual(exampleClient);
  });

  it("tries to create a new client when user already has one", async () => {
    await expect(
      createClient(exampleToken, {
        name: exampleClientName,
        description: exampleClientDesc,
      }),
    ).rejects.toEqual(exampleUserAlreadyHasAClientResponseError);
  });

  it("gets info for an existing client", async () => {
    const client: Client = await getClient(exampleToken);

    expect(client).not.toBe(undefined);
    expect(client).toEqual(exampleClient);
  });

  it("deletes a client", async () => {
    await deleteClient(exampleToken);

    const response = await deleteClient(exampleToken);
    expect(response).toBe(null);
  });

  it("deletes a client and check that the user_metadata has been cleared", async () => {
    await deleteClient(exampleToken);

    const response = await deleteClient(exampleToken);
    expect(response).toBe(null);

    server.use(
      http.get(AUTH0_USER_BY_ID, () => HttpResponse.json(exampleUser)),
    );

    const clientId = await getUserClientId(exampleUserID);
    expect(clientId).toBe("");
  });
});
