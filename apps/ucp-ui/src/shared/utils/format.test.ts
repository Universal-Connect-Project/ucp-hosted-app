import { formatMaxTwoDecimals } from "./format";

describe("format util", () => {
  describe("formatMaxTwoDecimals", () => {
    it("doesn't allow more than 2 decimals", () => {
      expect(formatMaxTwoDecimals(11.2345)).toEqual("11.23");
    });

    it("displays no decimals if not necessary", () => {
      expect(formatMaxTwoDecimals(1.0)).toEqual("1");
    });
  });
});
