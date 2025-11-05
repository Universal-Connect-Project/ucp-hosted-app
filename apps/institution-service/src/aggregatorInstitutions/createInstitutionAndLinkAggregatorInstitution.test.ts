/* eslint-disable @typescript-eslint/unbound-method */
import { Response } from "express";
import {
  createInstitutionAndLinkAggregatorInstitution,
  CreateInstitutionAndLinkAggregatorInstitutionRequest,
} from "./createInstitutionAndLinkAggregatorInstitution";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";

import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { Institution } from "../models/institution";

describe("createInstitutionAndLinkAggregatorInstitution", () => {
  let finicityAggregatorId: number;

  beforeAll(async () => {
    finicityAggregatorId = (await getAggregatorByName("finicity"))?.id;
  });

  beforeEach(async () => {
    await AggregatorIntegration.truncate();
    await AggregatorInstitution.truncate();
    await Institution.truncate({ cascade: true });
  });

  it("should create an institution and link it to an aggregator institution", async () => {
    const aggregatorInstitution = await AggregatorInstitution.create({
      aggregatorId: finicityAggregatorId,
      id: crypto.randomUUID(),
      name: "Test Aggregator Institution",
    });

    const req = {
      body: {
        aggregatorId: finicityAggregatorId,
        aggregatorInstitutionId: aggregatorInstitution.id,
        institutionData: {
          is_test_bank: true,
          keywords: ["test", "institution"],
          logo: "https://testinstitution.com/logo.png",
          name: "Test Institution",
          routing_numbers: ["123456789"],
          url: "https://testinstitution.com",
        },
      },
    } as unknown as CreateInstitutionAndLinkAggregatorInstitutionRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await createInstitutionAndLinkAggregatorInstitution(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const args = (res.json as jest.Mock).mock.calls[0][0] as {
      institutionId: string;
    };

    const institutionId = args.institutionId;

    expect(res.json).toHaveBeenCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      institutionId: expect.any(String),
      message: "Institution created and linked successfully",
    });

    const institutions = await aggregatorInstitution.getInstitutions();

    expect(institutions.length).toBe(1);
    expect(institutions[0]).toEqual(
      expect.objectContaining({
        id: institutionId,
        is_test_bank: req.body.institutionData.is_test_bank,
        keywords: req.body.institutionData.keywords,
        logo: req.body.institutionData.logo,
        name: req.body.institutionData.name,
        routing_numbers: req.body.institutionData.routing_numbers,
        url: req.body.institutionData.url,
      }),
    );

    expect(await Institution.count()).toBe(1);
  });

  it("should rollback the institution if creating an aggregator integration fails and handle errors gracefully", async () => {
    const aggregatorInstitution = await AggregatorInstitution.create({
      aggregatorId: finicityAggregatorId,
      id: crypto.randomUUID(),
      name: "Test Aggregator Institution",
    });

    const req = {
      body: {
        aggregatorId: finicityAggregatorId,
        aggregatorInstitutionId: aggregatorInstitution.id,
        institutionData: {
          name: "Test Institution",
          url: "https://testinstitution.com",
        },
      },
    } as unknown as CreateInstitutionAndLinkAggregatorInstitutionRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(AggregatorIntegration, "create").mockImplementation(() => {
      throw new Error("Simulated failure");
    });

    await createInstitutionAndLinkAggregatorInstitution(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to create and link institution",
    });

    expect(await Institution.count()).toBe(0);
  });

  it("should return 404 if the aggregator institution does not exist", async () => {
    const req = {
      body: {
        aggregatorId: finicityAggregatorId,
        aggregatorInstitutionId: "non-existent-id",
        institutionData: {
          name: "Test Institution",
          url: "https://testinstitution.com",
        },
      },
    } as unknown as CreateInstitutionAndLinkAggregatorInstitutionRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await createInstitutionAndLinkAggregatorInstitution(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Aggregator Institution not found",
    });
  });
});
