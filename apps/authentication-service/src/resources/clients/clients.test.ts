import { Client } from "auth0";
import { getClient, createClient, deleteClient } from "./clientsService";

describe("Clients test", () => {
  const clientId: string = "ucp-test-client";
  const clientName = "Ucp Test Client";
  const clientDesc = "For unit testing";

  it("Test Client Creation", async () => {
    const client: Client | Error = await createClient({
      name: clientName,
      description: clientDesc,
    });

    expect(client).not.toBe(undefined);
    expect((client as Client).client_id).toBe(clientId);
  });

  it("Test Client Get with ID", async () => {
    const client: Client | Error = await getClient(clientId);

    expect(client).not.toBe(undefined);
    expect((client as Client).client_id).toBe(clientId);
  });

  it("Test Client Delete", async () => {
    const client: Client | Error = await deleteClient(clientId);

    expect(client).not.toBe(undefined);
    expect((client as Client).client_id).toBe(clientId);
  });
});
