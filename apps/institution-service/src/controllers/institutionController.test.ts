import { Request, Response } from "express";
import { Institution } from "../models/institution";
import { cachedInstitutionFromSeed } from "../test/testData/institutions";
import {
  getAllInstitutions,
  getInstitutionCachedList,
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).not.toHaveProperty("error");
    });
  });

  describe("getInstitutionCachedList", () => {
    it("returns all institutions in the cached format", async () => {
      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getInstitutionCachedList(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining(cachedInstitutionFromSeed),
        ]),
      );
    });

    it("returns 404 on error", async () => {
      jest.spyOn(Institution, "findAll").mockImplementation(() => {
        throw new Error();
      });

      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getInstitutionCachedList(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error getting all Institutions",
      });
    });
  });
});
