import { Request, Response } from "express";
import { http, HttpResponse } from "msw";

import {
  AUTH0_CLIENTS,
  AUTH0_CLIENTS_BY_ID,
  AUTH0_USER_BY_ID,
} from "@/test/handlers";
import { server } from "@/test/testServer";
import {
  clientsCreateV1,
  clientsDeleteV1,
  clientsGetV1,
} from "@/resources/clients/clientsRoutesHandlers";
import { exampleClient } from "@/test/testData/clients";
import {
  exampleUserWithoutClient,
  exampleUserInfoResponse,
  getTestToken,
} from "@/test/testData/users";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("auth0", () => ({
  ...jest.requireActual("auth0"),
  UserInfoClient: class {
    getUserInfo = (_token: string) => ({ data: exampleUserInfoResponse });
  },
}));

describe("clientsRoutesHandlers", () => {
  describe("clientsCreateV1", () => {
    it("should create a new client", async () => {
      // Makes sure we get a User without a Client
      server.use(
        http.get(AUTH0_USER_BY_ID, () =>
          HttpResponse.json(exampleUserWithoutClient),
        ),
      );

      const token = getTestToken();

      const res = {
        json: jest.fn(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      await clientsCreateV1(req, res);

      expect(res.json).toHaveBeenCalledWith(exampleClient);
    });

    it("should error when trying to create a new client, when user already has one", async () => {
      const token = getTestToken();

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      await clientsCreateV1(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User already has a client",
      });
    });

    it("should error when trying to create a new client, and the rate limit has been reached", async () => {
      // Makes sure we get a User without a Client
      server.use(
        http.get(AUTH0_USER_BY_ID, () =>
          HttpResponse.json(exampleUserWithoutClient),
        ),
      );
      server.use(
        http.post(AUTH0_CLIENTS, () => new HttpResponse(null, { status: 429 })),
      );

      const token = getTestToken();

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      await clientsCreateV1(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({ message: "Rate limit exceeded" });
    });

    it("should error when trying to create a new client, and and unknown error occurs", async () => {
      // Makes sure we get a User without a Client
      server.use(
        http.get(AUTH0_USER_BY_ID, () =>
          HttpResponse.json(exampleUserWithoutClient),
        ),
      );
      server.use(
        http.post(AUTH0_CLIENTS, () => new HttpResponse(null, { status: 500 })),
      );

      const token = getTestToken();

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      await clientsCreateV1(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unable to create client",
      });
    });
  });

  describe("clientsGetV1", () => {
    it("should get client from a user token where user already is associated with a client", async () => {
      const token = getTestToken();

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      await clientsGetV1(req, res);

      expect(res.json).toHaveBeenCalledWith(exampleClient);
    });

    it("should error when trying to get client from a user who is not associated with a client", async () => {
      // Makes sure we get a User without a Client
      server.use(
        http.get(AUTH0_USER_BY_ID, () =>
          HttpResponse.json(exampleUserWithoutClient),
        ),
      );

      const token = getTestToken();

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      await clientsGetV1(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Client not found" });
    });

    it("should error when trying to get client, and the rate limit has been reached", async () => {
      server.use(
        http.get(
          AUTH0_CLIENTS_BY_ID,
          () => new HttpResponse(null, { status: 429 }),
        ),
      );

      const token = getTestToken();

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      await clientsGetV1(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({ message: "Rate limit exceeded" });
    });

    it("should error when trying to get client, and and unknown error occurs", async () => {
      server.use(
        http.get(
          AUTH0_CLIENTS_BY_ID,
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const token = getTestToken();

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      await clientsGetV1(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unable to get client",
      });
    });
  });

  describe("clientsDeleteV1", () => {
    it("should delete a client, based on the user token", async () => {
      const token = getTestToken();

      const res = {
        send: jest.fn(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      await clientsDeleteV1(req, res);

      expect(res.send).toHaveBeenCalledWith("Client successfully deleted.");
    });

    it("should error when trying to delete a client, and the client id is invalid", async () => {
      // Makes sure we get a User without a Client
      server.use(
        http.get(AUTH0_USER_BY_ID, () =>
          HttpResponse.json(exampleUserWithoutClient),
        ),
      );

      const token = getTestToken();

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      await clientsDeleteV1(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Client not found" });
    });

    it("should error when trying to delete a client, and the rate limit has been reached", async () => {
      server.use(
        http.delete(
          AUTH0_CLIENTS_BY_ID,
          () => new HttpResponse(null, { status: 429 }),
        ),
      );

      const token = getTestToken();

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      await clientsDeleteV1(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({ message: "Rate limit exceeded" });
    });

    it("should error when trying to get client, and an unknown error occurs", async () => {
      server.use(
        http.delete(
          AUTH0_CLIENTS_BY_ID,
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const token = getTestToken();

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      await clientsDeleteV1(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unable to delete client",
      });
    });
  });
});
