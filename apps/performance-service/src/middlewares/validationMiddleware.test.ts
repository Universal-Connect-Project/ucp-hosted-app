import { setEvent } from "../services/storageClient/redis";
import { createFakeAccessToken } from "../shared/tests/utils";
import {
  ERROR_MESSAGES,
  validateClientAccess,
  validateConnectionId,
} from "./validationMiddleware";
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

  it("should return 400 if connectionId is missing", async () => {
    await validateConnectionId(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.CONNECTION_REQUIRED,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 if connectionId does not exist", async () => {
    req.params = { connectionId: "invalid-id" };

    await validateConnectionId(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.CONNECTION_NOT_FOUND,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if connectionId exists", async () => {
    const connectionId = "validConnectionId";
    req.params = { connectionId };
    await setEvent(connectionId, {});

    await validateConnectionId(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("validateClientAccess", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const connectionId = "testConnectionId";
  const clientIdOnAccessToken = "realClientId";

  beforeEach(() => {
    req = {
      params: {
        connectionId,
      },
      headers: {
        authorization: createFakeAccessToken(clientIdOnAccessToken),
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should return 400 the clientId is different", async () => {
    await setEvent(connectionId, {
      connectionId,
      clientId: "differentClientId",
    });
    await validateClientAccess(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.UNAUTHORIZED_CLIENT,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next with valid client access", async () => {
    await setEvent(connectionId, {
      connectionId,
      clientId: clientIdOnAccessToken,
    });

    await validateClientAccess(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
