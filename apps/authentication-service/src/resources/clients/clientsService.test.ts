import { Client } from "auth0";
import { http, HttpResponse } from "msw";

import { AUTH0_USER_BY_ID } from "@/test/handlers";
import {
  exampleUser,
  exampleApiToken,
  exampleUserAlreadyHasAClientResponseError,
  exampleUserInfoResponse,
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

describe("Clients Service", () => {
  describe("createClient", () => {
    it("creates a new client", async () => {
      server.use(
        http.get(AUTH0_USER_BY_ID, () => HttpResponse.json(exampleUser)),
      );
      const client: Client = await createClient(exampleApiToken, {
        name: exampleClientName,
        description: exampleClientDesc,
      });

      expect(client).toEqual(exampleClient);
    });
    it("rejects when trying to create a new client when user already has one", async () => {
      await expect(
        createClient(exampleApiToken, {
          name: exampleClientName,
          description: exampleClientDesc,
        }),
      ).rejects.toEqual(exampleUserAlreadyHasAClientResponseError);
    });
  });

  describe("getClient success", () => {
    it("gets info for an existing client", async () => {
      const client: Client = await getClient(exampleApiToken);

      expect(client).toEqual(exampleClient);
    });
  });

  describe("deleteClient", () => {
    it("deletes a client", async () => {
      await deleteClient(exampleApiToken);

      const response = await deleteClient(exampleApiToken);
      expect(response).toBe("Client successfully deleted.");
    });
  });
});
