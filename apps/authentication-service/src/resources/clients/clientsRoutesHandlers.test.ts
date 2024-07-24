import { AUTH0_USER_BY_ID } from "@/test/handlers";
import { server } from "@/test/testServer";
import { Request, Response } from "express";
import { http, HttpResponse } from "msw";

import { ClientCreateBody } from "@/resources/clients/clientsModel";
import {
  clientsCreateV1,
  clientsGetV1,
} from "@/resources/clients/clientsRoutesHandlers";
import { exampleClient } from "@/test/testData/clients";
import {
  exampleUser,
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
  // 1. Test Create, Get, Delete
  // 2. Test error states?
  it("should create a new client", async () => {
    server.use(
      http.get(AUTH0_USER_BY_ID, () => HttpResponse.json(exampleUser)),
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
  it("should error when trying to create a new client when user already has one", async () => {
    const token = getTestToken();

    const res = {
      send: jest.fn(),
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
    expect(res.send).toHaveBeenCalledWith("User already has a client");
  });
  it("should get client from a user token where user already is associated with a client", async () => {
    const token = getTestToken();

    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    const req: Request<object, object, ClientCreateBody> = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request<object, object, ClientCreateBody>;

    await clientsGetV1(req as Request, res);

    expect(res.send).toHaveBeenCalledWith(exampleClient);
  });
});
