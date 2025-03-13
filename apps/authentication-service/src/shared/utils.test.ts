import { parseResponse } from "../shared/utils";

describe("utils", () => {
  describe("parseResponse", () => {
    it("returns the response if response is ok, and body is null", async () => {
      const response = {
        ok: true,
        status: 200,
        statusText: "OK",
        json: jest.fn(),
        body: null,
        headers: {},
      } as unknown as Response;

      const result = await parseResponse(response);

      expect(result).toEqual(response);
    });

    it("returns the json body if the response is ok and there is a body", async () => {
      const body = { key: "value" };

      const response = {
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => body,
        body,
        headers: {},
      } as unknown as Response;

      const result = await parseResponse<{ key: string }>(response);

      expect(result).toEqual(body);
    });

    it("returns an error if the response is not ok", async () => {
      const response = {
        ok: false,
        status: 400,
        statusText: "Bad request",
        json: () => null,
        body: null,
        headers: {},
      } as unknown as Response;

      await expect(parseResponse(response)).rejects.toEqual(
        new Error("Bad request"),
      );
    });
  });
});
