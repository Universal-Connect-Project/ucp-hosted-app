import { allJobTypeCombinations } from "./jobTypes";

describe("jobTypes", () => {
  describe("allJobTypeCombinations", () => {
    it("returns the right number of job type combinations", () => {
      expect(allJobTypeCombinations).toHaveLength(15);
    });
  });
});
