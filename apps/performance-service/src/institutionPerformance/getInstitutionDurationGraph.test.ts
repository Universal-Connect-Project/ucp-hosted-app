import { Request, Response } from "express";
import { testInstitutionId } from "../shared/tests/utils";
import { getInstitutionDurationGraph } from "./getInstitutionDurationGraph";

describe("getInstitutionDurationGraph", () => {
  it("returns institution graph data", async () => {
    const req = {
      params: {
        institutionId: testInstitutionId,
      },
      query: {
        timeFrame: "30d",
      },
    } as unknown as Request;

    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await getInstitutionDurationGraph(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(results.performance.length).toBeGreaterThan(0);
  });
});
