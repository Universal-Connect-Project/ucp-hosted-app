import { EventObject } from "../controllers/eventController";
import { setEvent } from "../services/storageClient/redis";
import { validateConnectionId } from "./validationMiddleware";
import { Request, Response, NextFunction } from "express";

describe("validateConnectionId Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should return 400 if connectionId does not exist", async () => {
    req.params = { connectionId: "invalid-id" };

    await validateConnectionId(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Connection not found",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if connectionId exists", async () => {
    const connectionId = "validConnectionId";
    req.params = { connectionId };
    await setEvent(connectionId, {} as unknown as EventObject);

    await validateConnectionId(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
