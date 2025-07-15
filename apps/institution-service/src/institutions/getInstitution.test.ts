/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Request, Response } from "express";
import { seedInstitutionId } from "../test/testData/institutions";
import { createTestAuthorization } from "../test/utils";
import { getInstitution } from "./getInstitution";

describe("getInstitution", () => {
  it("responds with an institution and has the expected attributes", async () => {
    const req = {
      headers: {
        authorization: createTestAuthorization({
          permissions: [],
        }),
      },
      params: { id: seedInstitutionId },
    } as unknown as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getInstitution(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        institution: expect.objectContaining({
          id: seedInstitutionId,
          name: "Wells Fargo",
          keywords: ["wells", "fargo"],
          logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867_100x100.png",
          url: "https://wellsfargo.com",
          is_test_bank: false,
          routing_numbers: ["111111111"],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          aggregatorIntegrations: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              aggregator_institution_id: expect.any(String),
              supports_oauth: expect.any(Boolean),
              supports_identification: expect.any(Boolean),
              supports_verification: expect.any(Boolean),
              supports_aggregation: expect.any(Boolean),
              supports_history: expect.any(Boolean),
              supportsRewards: expect.any(Boolean),
              supportsBalance: expect.any(Boolean),
              isActive: expect.any(Boolean),
              aggregator: expect.objectContaining({
                name: expect.any(String),
                id: expect.any(Number),
                displayName: expect.any(String),
                logo: "https://logo.com",
              }),
            }),
          ]),
        }),
        permissions: expect.objectContaining({
          aggregatorIntegrationPermissionsMap: expect.any(Object),
          aggregatorsThatCanBeAdded: [],
          canDeleteInstitution: expect.any(Boolean),
          canEditInstitution: expect.any(Boolean),
        }),
      }),
    );

    const aggregatorIntegrationPermissionsMap = (res.json as jest.Mock).mock
      .calls[0]?.[0]?.permissions?.aggregatorIntegrationPermissionsMap;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    expect(Object.values(aggregatorIntegrationPermissionsMap)[0]).toEqual(
      expect.objectContaining({
        canDelete: expect.any(Boolean),
        canEdit: expect.any(Boolean),
      }),
    );
  });

  it("responds with 404 when id param is invalid", async () => {
    const req = {
      params: { id: "123" },
    } as unknown as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getInstitution(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Institution not found",
    });
  });

  it("responds with 404 when id param is valid but not belonging to an institution", async () => {
    const req = {
      params: { id: "ee6d71dc-e693-4fc3-a775-53c378bc5066" },
    } as unknown as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getInstitution(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Institution not found",
    });
  });
});
