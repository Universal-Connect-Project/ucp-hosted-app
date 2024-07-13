import { Client } from "auth0";
import { http, HttpResponse } from "msw";

import { AUTH0_CLIENTS_BY_ID, AUTH0_USER_BY_ID } from "@/test/handlers";
import {
  exampleUser,
  exampleToken,
  exampleUserAlreadyHasAClientResponseError,
  exampleUserInfoResponse,
} from "@/test/testData/users";
import { server } from "@/test/testServer";
import {
  clientRotateSecretError,
  exampleClient,
  exampleClientDesc,
  exampleClientName,
  exampleClientRotatedSecret,
} from "@/test/testData/clients";
import {
  getClient,
  createClient,
  deleteClient,
  rotateClientSecret,
} from "./clientsService";

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
      const client: Client = await createClient(exampleToken, {
        name: exampleClientName,
        description: exampleClientDesc,
      });

      expect(client).toEqual(exampleClient);
    });
  });

  describe("getClient success", () => {
    it("gets info for an existing client", async () => {
      const client: Client = await getClient(exampleToken);

      expect(client).toEqual(exampleClient);
    });
    it("rejects when trying to create a new client when user already has one", async () => {
      await expect(
        createClient(exampleToken, {
          name: exampleClientName,
          description: exampleClientDesc,
        }),
      ).rejects.toEqual(exampleUserAlreadyHasAClientResponseError);
    });
  });

  describe("rotateClientSecret", () => {
    it("rotate secret for existing client", async () => {
      const client: Client = await rotateClientSecret(exampleToken);

      expect(client).toEqual(exampleClientRotatedSecret);
    });
  });

  describe("deleteClient", () => {
    it("deletes a client", async () => {
      await deleteClient(exampleToken);

      const response = await deleteClient(exampleToken);
      expect(response).toBe(null);
    });
  });

  describe("rotateClientSecret with error", () => {
    it("rotate secret for non-existing client", async () => {
      server.use(
        http.post(
          `${AUTH0_CLIENTS_BY_ID}/rotate-secret`,
          () => clientRotateSecretError,
        ),
      );

      await expect(rotateClientSecret(exampleToken)).rejects.toEqual(
        new Error("Not Found"),
      );
    });
  });
});
