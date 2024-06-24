import { AUTH0_USER_BY_ID } from "@/test/handlers";
import { Client } from "auth0";
import { http, HttpResponse } from "msw";
import { exampleUser } from "@/test/testData/users";
import { server } from "@/test/testServer";
import { getClient, createClient, deleteClient } from "./clientsService";

beforeAll(() => {});

describe("Clients test", () => {
  const userId = "google-oauth2|115545703201865461059";
  const clientId: string = "ucp-test-client";
  const clientName = "Ucp Test Client";
  const clientDesc = "For unit testing";

  it("creates a new client", async () => {
    server.use(
      http.get(AUTH0_USER_BY_ID, () => HttpResponse.json(exampleUser)),
    );
    const client: Client = await createClient(userId, {
      name: clientName,
      description: clientDesc,
    });

    expect(client).not.toBe(undefined);
    expect(client.client_id).toBe(clientId);
  });

  it("gets info for an existing client", async () => {
    const client: Client = await getClient(clientId);

    expect(client).not.toBe(undefined);
    expect(client.client_id).toBe(clientId);
  });

  it("deletes a client", async () => {
    const client: Client = await deleteClient(clientId);

    expect(client).not.toBe(undefined);
    expect(client.client_id).toBe(clientId);
  });
});
