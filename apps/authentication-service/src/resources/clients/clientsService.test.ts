import { Client } from "auth0";
import { http, HttpResponse, JsonBodyType } from "msw";

import { AUTH0_USER_BY_ID } from "@/test/handlers";
import { exampleUser, exampleToken } from "@/test/testData/users";
import { server } from "@/test/testServer";
import { getClient, createClient, deleteClient } from "./clientsService";

describe("Clients test", () => {
  const clientId: string = "ucp-test-client";
  const clientName = "Ucp Test Client";
  const clientDesc = "For unit testing";

  it("creates a new client", async () => {
    server.use(
      http.get(AUTH0_USER_BY_ID, () =>
        HttpResponse.json(exampleUser as JsonBodyType),
      ),
    );
    const client: Client = await createClient(exampleToken, {
      name: clientName,
      description: clientDesc,
    });

    expect(client).not.toBe(undefined);
    expect(client.client_id).toBe(clientId);
  });

  it("gets info for an existing client", async () => {
    const client: Client = await getClient(exampleToken);

    expect(client).not.toBe(undefined);
    expect(client.client_id).toBe(clientId);
  });

  it("deletes a client", async () => {
    const client: Client = await deleteClient(exampleToken);

    expect(client).not.toBe(undefined);
    expect(client.client_id).toBe(clientId);
  });
});
