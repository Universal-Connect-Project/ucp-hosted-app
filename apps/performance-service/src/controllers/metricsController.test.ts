import { Request, Response } from "express";
import { queryApi } from "../services/influxDb";
import {
  createTestScenarioEvents,
  expectedTransformedInstitutionData,
} from "../shared/tests/testData/influx";
import { getPerformanceRoutingJson } from "./metricsController";
import { wait } from "../shared/tests/utils";

describe("getPerformanceRoutingJson", () => {
  it("queries influxdb and transforms the data properly", async () => {
    const req = {
      params: {},
    } as unknown as Request;

    const res = {
      send: jest.fn(),
    } as unknown as Response;

    const testInstitutionId = `bank1-${crypto.randomUUID()}`;
    const testInstitutionId2 = `bank2-${crypto.randomUUID()}`;

    await createTestScenarioEvents(testInstitutionId, testInstitutionId2);
    await wait(2000);

    await getPerformanceRoutingJson(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    expect(results).toEqual(
      expect.objectContaining(
        expectedTransformedInstitutionData(
          testInstitutionId,
          testInstitutionId2,
        ),
      ),
    );
  });

  it("returns 400 and an error on failure", async () => {
    const req = {
      params: {},
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const errorMessage = "Test error";
    jest.spyOn(queryApi, "collectRows").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await getPerformanceRoutingJson(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });
  });
});
