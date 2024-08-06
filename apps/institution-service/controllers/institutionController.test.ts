import { Request, Response } from "express";
import {
  getAllInstitutions,
} from "./institutionController";

describe("institutionController", () => {
  describe("getAllInstitutions", () => {
    it("returns all institutions", async () => {
      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getAllInstitutions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).not.toHaveProperty("error");
    });
  });
});
