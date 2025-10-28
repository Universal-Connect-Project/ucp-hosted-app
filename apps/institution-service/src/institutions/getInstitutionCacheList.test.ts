/* eslint-disable @typescript-eslint/unbound-method */
import { Request, Response } from "express";

import { Institution } from "../models/institution";
import { getInstitutionCachedList } from "./getInstitutionCacheList";
import { clearInstitutionCache } from "../shared/services/institutionCacheManager";
import { createTestInstitution } from "../test/createTestInstitution";

describe("getInstitutionCachedList", () => {
  beforeEach(() => {
    clearInstitutionCache();
  });

  it("returns all institutions in the cached format, doesn't return aggregator connections that aren't active, and filters out institutions that don't have any aggregator connections", async () => {
    const { aggregatorIntegrations, cleanupInstitution, institution } =
      await createTestInstitution({
        aggregatorIntegrations: {
          mx: { isActive: true },
          sophtron: { isActive: false },
        },
      });

    const req = {} as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getInstitutionCachedList(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const institutionList: {
      sophtron: undefined;
      mx: object;
      id: string;
    }[] =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (res.json as jest.Mock).mock.calls[0][0];

    const foundInstitution = institutionList.find(
      (inst: { id: string }) => inst.id === institution.id,
    );

    expect(foundInstitution!.sophtron).toBeUndefined();
    expect(foundInstitution!.mx).toEqual(
      expect.objectContaining({
        id: aggregatorIntegrations.mx.aggregator_institution_id,
      }),
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: institution.id,
          name: institution.name,
          url: institution.url,
          logo: institution.logo,
          keywords: institution.keywords,
          is_test_bank: institution.is_test_bank,
          routing_numbers: institution.routing_numbers,
        }),
      ]),
    );

    await cleanupInstitution();
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
