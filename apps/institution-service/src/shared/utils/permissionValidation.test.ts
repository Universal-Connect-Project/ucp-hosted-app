import { UiUserPermissions } from "@repo/shared-utils";
import { createTestAuthorization } from "../../test/utils";
import {
  EditAggregatorIntegrationValidationErrorReason,
  EditInstitutionValidationErrorReason,
  validateUserCanCreateAggregatorIntegration,
  validateUserCanEditAggregatorIntegration,
  validateUserCanEditInstitution,
} from "./permissionValidation";
import { Request } from "express";
import { Institution } from "../../models/institution";

const mxOnlyInstitutionId = "559848ae-c552-4e8a-a391-64e23a609114";
const allAggregatorsInstitutionId = "d7b98242-3645-4de4-b770-f59a197942cb";

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

  describe("validateUserCanEditAggregatorIntegration", () => {
    it("returns true if they're a super admin", async () => {
      expect(
        await validateUserCanEditAggregatorIntegration({
          aggregatorIntegrationId: "test",
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION],
              }),
            },
          } as Request,
        }),
      ).toBe(true);
    });

    it("returns true if they're an aggregator and are editing their own integration", async () => {
      const institution = await Institution.findByPk(mxOnlyInstitutionId, {
        include: [
          {
            association: Institution.associations.aggregatorIntegrations,
            attributes: ["id"],
          },
        ],
      });

      expect(
        await validateUserCanEditAggregatorIntegration({
          aggregatorIntegrationId: `${institution?.aggregatorIntegrations?.[0]?.id}`,
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [
                  UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
                ],
              }),
            },
          } as Request,
        }),
      ).toBe(true);
    });

    it("returns InsufficientScope if they're not an aggregator or super admin", async () => {
      expect(
        await validateUserCanEditAggregatorIntegration({
          aggregatorIntegrationId: "test",
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [],
              }),
            },
          } as Request,
        }),
      ).toBe(EditAggregatorIntegrationValidationErrorReason.InsufficientScope);
    });

    it("returns InvalidAggregatorIntegrationId if the integration isn't found", async () => {
      expect(
        await validateUserCanEditAggregatorIntegration({
          aggregatorIntegrationId: `${-1}`,
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [
                  UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
                ],
              }),
            },
          } as Request,
        }),
      ).toBe(
        EditAggregatorIntegrationValidationErrorReason.InvalidAggregatorIntegrationId,
      );
    });

    it("returns GenericError if findByPk fails", async () => {
      jest.spyOn(Institution, "findByPk").mockRejectedValue(new Error());

      expect(
        await validateUserCanEditAggregatorIntegration({
          aggregatorIntegrationId: "test",
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [
                  UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
                ],
              }),
            },
          } as Request,
        }),
      ).toBe(EditAggregatorIntegrationValidationErrorReason.GenericError);
    });

    it("returns NotYourAggregator if an aggregator attempts to edit a different aggregator's integration", async () => {
      const institution = await Institution.findByPk(mxOnlyInstitutionId, {
        include: [
          {
            association: Institution.associations.aggregatorIntegrations,
            attributes: ["id"],
          },
        ],
      });

      expect(
        await validateUserCanEditAggregatorIntegration({
          aggregatorIntegrationId: `${institution?.aggregatorIntegrations?.[0]?.id}`,
          req: {
            headers: {
              authorization: createTestAuthorization({
                aggregatorId: "sophtron",
                permissions: [
                  UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
                ],
              }),
            },
          } as Request,
        }),
      ).toBe(EditAggregatorIntegrationValidationErrorReason.NotYourAggregator);
    });
  });

  describe("validateUserCanCreateAggregatorIntegration", () => {
    it("returns true if they are a super admin and there are aggregators without an integration", async () => {
      expect(
        await validateUserCanCreateAggregatorIntegration({
          institutionId: mxOnlyInstitutionId,
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION],
              }),
            },
          } as Request,
        }),
      ).toBe(true);
    });

    it("returns false if they are a super admin and there aren't aggregators without an integration", async () => {
      expect(
        await validateUserCanCreateAggregatorIntegration({
          institutionId: allAggregatorsInstitutionId,
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION],
              }),
            },
          } as Request,
        }),
      ).toBe(false);
    });

    it("returns true if they are an aggregator and there isn't an integration for their aggregator", async () => {
      expect(
        await validateUserCanCreateAggregatorIntegration({
          institutionId: mxOnlyInstitutionId,
          req: {
            headers: {
              authorization: createTestAuthorization({
                aggregatorId: "sophtron",
                permissions: [
                  UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
                ],
              }),
            },
          } as Request,
        }),
      ).toBe(true);
    });

    it("returns false if they are an aggregator and there is an integration for their aggregator", async () => {
      expect(
        await validateUserCanCreateAggregatorIntegration({
          institutionId: mxOnlyInstitutionId,
          req: {
            headers: {
              authorization: createTestAuthorization({
                aggregatorId: "mx",
                permissions: [
                  UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
                ],
              }),
            },
          } as Request,
        }),
      ).toBe(false);
    });

    it("returns false if they are an aggregator, but they don't have a valid aggregatorName", async () => {
      expect(
        await validateUserCanCreateAggregatorIntegration({
          institutionId: mxOnlyInstitutionId,
          req: {
            headers: {
              authorization: createTestAuthorization({
                aggregatorId: "junk",
                permissions: [
                  UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
                ],
              }),
            },
          } as Request,
        }),
      ).toBe(false);
    });

    it("returns false if they aren't an aggregator or super admin", async () => {
      expect(
        await validateUserCanCreateAggregatorIntegration({
          institutionId: mxOnlyInstitutionId,
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [],
              }),
            },
          } as Request,
        }),
      ).toBe(false);
    });
  });
});
