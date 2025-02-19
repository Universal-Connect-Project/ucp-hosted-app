import { Request, Response } from "express";
import { queryApi } from "../services/influxDb";
import {
  influxQueryResults,
  transformedInstitutionData,
} from "../shared/tests/testData/influx";
import { getPerformanceRoutingJson } from "./metricsController";

describe("getPerformanceRoutingJson", () => {
  it("queries influxdb and transforms the data properly", async () => {
    const req = {
      params: {},
    } as unknown as Request;

    const res = {
      send: jest.fn(),
    } as unknown as Response;

    jest.spyOn(queryApi, "collectRows").mockResolvedValue(influxQueryResults);

    await getPerformanceRoutingJson(req, res);

    expect(res.send).toHaveBeenCalledWith(transformedInstitutionData);
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
