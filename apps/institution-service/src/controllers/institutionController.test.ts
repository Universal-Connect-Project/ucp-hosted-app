/* eslint-disable @typescript-eslint/unbound-method */
import { Request, Response } from "express";

import { Institution } from "../models/institution";
import { cachedInstitutionFromSeed } from "../test/testData/institutions";
import { getInstitutionCachedList } from "./institutionController";

describe("institutionController", () => {
  describe("getInstitutionCachedList", () => {
    it("returns all institutions in the cached format, doesn't return aggregator connections that aren't active, and filters out institutions that don't have any aggregator connections", async () => {
      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getInstitutionCachedList(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining(cachedInstitutionFromSeed),
        ]),
      );
    });

    it("returns 404 on error", async () => {
      jest.spyOn(Institution, "findAll").mockRejectedValue(new Error());

      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getInstitutionCachedList(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error getting all Institutions",
      });
    });
  });
});
