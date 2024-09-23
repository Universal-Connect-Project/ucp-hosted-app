import { INVALID_URL_TEXT, validateUrlRule } from "./validation";

describe("validation", () => {
  describe("validateUrlRule", () => {
    it("fails if not a valid url with a message", () => {
      expect(validateUrlRule("junk")).toEqual(INVALID_URL_TEXT);
      expect(validateUrlRule("http://")).toEqual(INVALID_URL_TEXT);
    });

    it("succeeds if it looks like a url", () => {
      expect(validateUrlRule("http://test")).toEqual(true);
    });
  });
});
