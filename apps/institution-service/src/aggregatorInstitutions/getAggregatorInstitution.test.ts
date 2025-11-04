/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";
import { getAggregatorInstitution } from "./getAggregatorInstitution";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { createTestInstitution } from "../test/createTestInstitution";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { Institution } from "../models/institution";

describe("getAggregatorInstitution", () => {
  beforeEach(async () => {
    await AggregatorInstitution.truncate({ cascade: true, force: true });
    await AggregatorIntegration.truncate({ cascade: true, force: true });
    await Institution.truncate({ cascade: true, force: true });
  });

  afterAll(async () => {
    await AggregatorInstitution.truncate({ cascade: true, force: true });
    await AggregatorIntegration.truncate({ cascade: true, force: true });
    await Institution.truncate({ cascade: true, force: true });
  });

  it("should retrieve an aggregator institution by ID and aggregatorId and include the aggregator and matched institutions", async () => {
    const finicityAggregatorId = (await getAggregatorByName("finicity")).id;

    const id = "testInstitution";

    await AggregatorInstitution.create({
      id,
      aggregatorId: finicityAggregatorId,
      name: "Test Institution",
    });

    const { institution: institution1 } = await createTestInstitution({
      aggregatorIntegrations: {
        finicity: {
          aggregator_institution_id: id,
        },
      },
    });

    const { institution: institution2 } = await createTestInstitution({
      aggregatorIntegrations: {
        mx: {
          aggregator_institution_id: id,
        },
        finicity: {
          aggregator_institution_id: id,
        },
      },
    });

    await createTestInstitution({
      aggregatorIntegrations: {
        mx: {
          aggregator_institution_id: "different",
        },
      },
    });

    const req = {
      params: {
        aggregatorId: finicityAggregatorId,
        id,
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getAggregatorInstitution(req, res);

    const firstCall = (res.json as jest.Mock).mock.calls[0][0];

    expect(firstCall.institution.institutions).toHaveLength(2);

    expect(res.json).toHaveBeenCalledWith({
      institution: expect.objectContaining({
        id,
        aggregatorId: finicityAggregatorId,
        aggregator: expect.objectContaining({
          id: finicityAggregatorId,
          name: "finicity",
        }),
        institutions: expect.arrayContaining([
          expect.objectContaining({
            id: institution1.id,
          }),
          expect.objectContaining({
            id: institution2.id,
          }),
        ]),
      }),
    });
  });
});
