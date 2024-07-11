import { Client } from "auth0";
import { http, HttpResponse } from "msw";

import { AUTH0_USER_BY_ID } from "@/test/handlers";
import {
  exampleUser,
  exampleToken,
  exampleUserInfoResponse,
  exampleUserAlreadyHasAClientResponseError,
} from "@/test/testData/users";
import { server } from "@/test/testServer";
import { exampleClient } from "@/test/testData/clients";
import { getClient, createClient, deleteClient } from "./clientsService";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("auth0", () => ({
  ...jest.requireActual("auth0"),
  UserInfoClient: class {
    getUserInfo = (_token: string) => ({ data: exampleUserInfoResponse });
  },
}));

describe("Clients test", () => {
  const clientId: string = "ucp-test-client";
  const clientName = "UCP Test Client";
  const clientDesc = "For unit testing";

  it("creates a new client", async () => {
    server.use(
      http.get(AUTH0_USER_BY_ID, () => HttpResponse.json(exampleUser)),
    );
    const client: Client = await createClient(exampleToken, {
      name: clientName,
      description: clientDesc,
    });

    expect(client).not.toBe(undefined);
    expect(client).toEqual(exampleClient);
  });

  it("creates a new client when user already has one", async () => {
    await expect(
      createClient(exampleToken, {
        name: clientName,
        description: clientDesc,
      }),
    ).rejects.toEqual(exampleUserAlreadyHasAClientResponseError);
  });

  it("gets info for an existing client", async () => {
    const client: Client = await getClient(exampleToken);

    expect(client).not.toBe(undefined);
    expect(client.client_id).toBe(clientId);
  });

  it("deletes a client", async () => {
    await deleteClient(exampleToken);

    const response = await deleteClient(exampleToken);
    expect(response).toBe(null);
  });

  it("removes client_id from user metadata", async () => {});
});
