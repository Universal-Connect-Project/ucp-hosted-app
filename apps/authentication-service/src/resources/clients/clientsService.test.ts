import { Client, ClientGrant } from "auth0";
import { http, HttpResponse } from "msw";

import { AUTH0_USER_BY_ID } from "@/test/handlers";
import {
  exampleUserWithoutClient,
  exampleApiToken,
  exampleUserAlreadyHasAClientResponseError,
  exampleUserInfoResponse,
} from "@/test/testData/users";
import { server } from "@/test/testServer";
import {
  exampleClientDesc,
  exampleClientName,
  exampleAuth0Client,
  exampleClientRotatedSecret,
  exampleClientGrant,
} from "@/test/testData/clients";
import {
  getClient,
  createClient,
  deleteClient,
  rotateClientSecret,
  setClientGrant,
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
        http.get(AUTH0_USER_BY_ID, () =>
          HttpResponse.json(exampleUserWithoutClient),
        ),
      );
      const client: Client = await createClient(exampleApiToken, {
        name: exampleClientName,
        description: exampleClientDesc,
      });

      expect(client).toEqual(exampleAuth0Client);
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

      expect(client).toEqual(exampleAuth0Client);
    });
  });

  describe("deleteClient", () => {
    it("deletes a client", async () => {
      await deleteClient(exampleApiToken);

      const response = await deleteClient(exampleApiToken);
      expect(response.message).toBe("Keys successfully deleted");
    });
  });

  describe("rotateClientSecret", () => {
    it("rotate secret for existing client", async () => {
      const client: Client = await rotateClientSecret(exampleApiToken);

      expect(client).toEqual(exampleClientRotatedSecret);
    });
  });

  describe("setClientGrant", () => {
    it("grant client access to widget api", async () => {
      const clientGrant: ClientGrant = await setClientGrant(exampleClientGrant);

      expect(clientGrant).toEqual(exampleClientGrant);
    });
  });
});
