import { Request, Response } from "express";
import {
  createStartEvent,
  updateConnectionPause,
  updateConnectionResume,
  updateSuccessEvent,
} from "./eventController";

describe("eventController", () => {
  describe("createStartEvent", () => {
    it("should return 201 when valid", () => {
      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      createStartEvent(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "TODO: implement start in next ticket",
      });
    });

    it("should return 400 status and error message when an error is thrown", () => {
      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const errorMessage = "Test error";
      jest.spyOn(res, "status").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      createStartEvent(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });
    });
  });

  describe("updateConnectionPause", () => {
    it("should return 201 when valid", () => {
      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      updateConnectionPause(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "TODO: implement update challenge in next ticket",
      });
    });

    it("should return 400 status and error message when an error is thrown", () => {
      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const errorMessage = "Test error";
      jest.spyOn(res, "status").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      updateConnectionPause(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });
    });
  });

  describe("updateConnectionResume", () => {
    it("should return 201 when valid", () => {
      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      updateConnectionResume(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "TODO: implement challenge resumed in next ticket",
      });
    });

    it("should return 400 status and error message when an error is thrown", () => {
      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const errorMessage = "Test error";
      jest.spyOn(res, "status").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      updateConnectionResume(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });
    });
  });

  describe("updateSuccessEvent", () => {
    it("should return 201 when valid", () => {
      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      updateSuccessEvent(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "TODO: implement success event in next ticket",
      });
    });

    it("should return 400 status and error message when an error is thrown", () => {
      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const errorMessage = "Test error";
      jest.spyOn(res, "status").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      updateSuccessEvent(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });
    });
  });
});
