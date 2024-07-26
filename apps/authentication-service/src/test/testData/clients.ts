import { Client } from "auth0";
import { Keys } from "@/resources/clients/clientsModel";

export const exampleClientName = "UCP Test Client";
export const exampleClientDesc = "For unit testing";

export const exampleUCPClient: Partial<Keys> = {
  clientId: "ucp-test-client",
  clientSecret: "fake-secret",
};

export const exampleAuth0Client: Partial<Client> = {
  client_id: "ucp-test-client",
  client_secret: "fake-secret",
};
