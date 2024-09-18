import {
  cachedInstitutionFromSeed,
  institutionWithAggregatorQueryObj,
} from "../test/testData/institutions";
import { transformInstitutionToCachedInstitution } from "./institutionService";

describe("institutionService", () => {
  describe("transformInstitutionToCachedInstitution", () => {
    it("transforms database objects", () => {
      const cachedInstitutionList = transformInstitutionToCachedInstitution(
        institutionWithAggregatorQueryObj,
      );
      expect(cachedInstitutionList).toEqual(cachedInstitutionFromSeed);
    });
  });
});
