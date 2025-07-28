import { Request, Response } from "express";
import { getPerformanceAuthInstitutions } from "./getPerformanceAuthInstitutions";

describe("getPerformanceAuthInstitutions", () => {
  it("should return institutions with pagination and sorting", async () => {});

  it("searches for institutions by name or keywords", async () => {});

  it("defaults to sorting by name in ascending order", async () => {
    const req = {
      query: {
        page: 1,
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getPerformanceAuthInstitutions(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const firstCall = (res.json as jest.Mock).mock.calls[0][0];

    console.log(firstCall);
    expect;
  });
});
