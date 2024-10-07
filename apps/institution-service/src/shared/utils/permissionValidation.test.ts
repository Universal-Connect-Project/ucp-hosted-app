import { UiUserPermissions } from "@repo/shared-utils";
import { createTestAuthorization } from "../../test/utils";
import {
  EditInstitutionValidationErrorReason,
  validateUserCanEditInstitution,
} from "./permissionValidation";
import { Request } from "express";
import { Institution } from "../../models/institution";

describe("permissionValidation", () => {
  describe("validateUserCanEditInstitution", () => {
    it("returns true if they are a super admin", async () => {
      expect(
        await validateUserCanEditInstitution({
          institutionId: "test",
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [UiUserPermissions.UPDATE_INSTITUTION],
              }),
            },
          } as Request,
        }),
      ).toBe(true);
    });

    it("returns true if they are an aggregator and they're the only aggregatorIntegration", async () => {
      const mxOnlyInstitutionId = "559848ae-c552-4e8a-a391-64e23a609114";

      expect(
        await validateUserCanEditInstitution({
          institutionId: mxOnlyInstitutionId,
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [UiUserPermissions.UPDATE_INSTITUTION_AGGREGATOR],
              }),
            },
          } as Request,
        }),
      ).toBe(true);
    });

    it("returns UsedByOtherAggregators if they are an aggregator and there is another aggregator", async () => {
      const mxOnlyInstitutionId = "559848ae-c552-4e8a-a391-64e23a609114";

      expect(
        await validateUserCanEditInstitution({
          institutionId: mxOnlyInstitutionId,
          req: {
            headers: {
              authorization: createTestAuthorization({
                aggregatorId: "sophtron",
                permissions: [UiUserPermissions.UPDATE_INSTITUTION_AGGREGATOR],
              }),
            },
          } as Request,
        }),
      ).toBe(EditInstitutionValidationErrorReason.UsedByOtherAggregators);
    });

    it("returns InsufficientScope if they're not an aggregator or super admin", async () => {
      expect(
        await validateUserCanEditInstitution({
          institutionId: "test",
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [],
              }),
            },
          } as Request,
        }),
      ).toBe(EditInstitutionValidationErrorReason.InsufficientScope);
    });

    it("returns GenericError if findByPk fails", async () => {
      jest.spyOn(Institution, "findByPk").mockRejectedValue(new Error());

      expect(
        await validateUserCanEditInstitution({
          institutionId: "test",
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [UiUserPermissions.UPDATE_INSTITUTION_AGGREGATOR],
              }),
            },
          } as Request,
        }),
      ).toBe(EditInstitutionValidationErrorReason.GenericError);
    });

    it("returns InvalidInstitutionId if the institution isn't found", async () => {
      expect(
        await validateUserCanEditInstitution({
          institutionId: crypto.randomUUID(),
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [UiUserPermissions.UPDATE_INSTITUTION_AGGREGATOR],
              }),
            },
          } as Request,
        }),
      ).toBe(EditInstitutionValidationErrorReason.InvalidInstitutionId);
    });
  });
});
