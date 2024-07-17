import { Request, Response } from "express";

import { ClientCreateBody } from "@/resources/clients/clientsModel";
import { clientsCreateV1 } from "@/resources/clients/clientsRoutesHandlers";
import { exampleClient } from "@/test/testData/clients";

describe("clientsRoutesHandlers", () => {
  // 1. Test Create, Get, Delete
  // 2. Test error states?
  it("should create a new client", async () => {
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
      json: jest.fn(),
    } as unknown as Response;

    const req: Request<object, object, ClientCreateBody> = {} as Request<
      object,
      object,
      ClientCreateBody
    >;

    await clientsCreateV1(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(exampleClient);
  });
});
