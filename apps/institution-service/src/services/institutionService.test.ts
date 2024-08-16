import {
  cachedInstitutionFromSeed,
  institutionWithProviderQueryObj,
} from "../test/testData/institutions";
import { transformInstitutionToCachedInstitution } from "./institutionService";

describe("institutionService", () => {
  describe("transformInstitutionToCachedInstitution", () => {
    it("transforms database objects", () => {
      const cachedInstitutionList = transformInstitutionToCachedInstitution(
        institutionWithProviderQueryObj,
      );
      expect(cachedInstitutionList).toEqual(cachedInstitutionFromSeed);
    });
  });
});
