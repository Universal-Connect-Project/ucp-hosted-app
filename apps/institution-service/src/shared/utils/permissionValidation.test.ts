import { UiUserPermissions } from "@repo/shared-utils";
import { Request } from "express";
import { Institution } from "../../models/institution";
import { createTestAuthorization } from "../../test/utils";
import {
  ActOnAggregatorIntegrationValidationErrorReason,
  ActOnInstitutionValidationErrorReason,
  getAggregatorNameFromRequest,
  getPermissionsFromRequest,
  getUsersAggregatorIntegrationCreationPermissions,
  validateUserCanDeleteAggregatorIntegration,
  validateUserCanDeleteInstitution,
  validateUserCanEditAggregatorIntegration,
  validateUserCanEditInstitution,
} from "./permissionValidation";
import { createTestInstitution } from "../../test/createTestInstitution";
import { UUID } from "crypto";

const createValidateInstitutionPermissions = ({
  adminPermission,
  aggregatorPermission,
  validateFunction,
}: {
  adminPermission: string;
  aggregatorPermission: string;
  validateFunction: ({
    institutionId,
    req,
  }: {
    institutionId: string;
    req: Request;
  }) => Promise<true | ActOnInstitutionValidationErrorReason>;
}) =>
  describe(`validate permissions for ${adminPermission}`, () => {
    let mxOnlyInstitutionId: UUID;
    let cleanup: () => Promise<void>;

    beforeAll(async () => {
      const mxOnlyInstitution = await createTestInstitution({
        aggregatorIntegrations: {
          mx: true,
        },
      });
      mxOnlyInstitutionId = mxOnlyInstitution.institution.id as UUID;
      cleanup = mxOnlyInstitution.cleanupInstitution;
    });

    afterAll(async () => {
      await cleanup();
    });

    it("returns true if they are a super admin", async () => {
      expect(
        await validateFunction({
          institutionId: "test",
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [adminPermission],
              }),
            },
          } as Request,
        }),
      ).toBe(true);
    });

    it("returns true if they are an aggregator and they're the only aggregatorIntegration", async () => {
      expect(
        await validateFunction({
          institutionId: mxOnlyInstitutionId,
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [aggregatorPermission],
              }),
            },
          } as Request,
        }),
      ).toBe(true);
    });

    it("returns UsedByOtherAggregators if they are an aggregator and there is another aggregator", async () => {
      expect(
        await validateFunction({
          institutionId: mxOnlyInstitutionId,
          req: {
            headers: {
              authorization: createTestAuthorization({
                aggregatorId: "sophtron",
                permissions: [aggregatorPermission],
              }),
            },
          } as Request,
        }),
      ).toBe(ActOnInstitutionValidationErrorReason.UsedByOtherAggregators);
    });

    it("returns InsufficientScope if they're not an aggregator or super admin", async () => {
      expect(
        await validateFunction({
          institutionId: "test",
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [],
              }),
            },
          } as Request,
        }),
      ).toBe(ActOnInstitutionValidationErrorReason.InsufficientScope);
    });

    it("returns GenericError if findByPk fails", async () => {
      jest.spyOn(Institution, "findByPk").mockRejectedValue(new Error());

      expect(
        await validateFunction({
          institutionId: "test",
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [aggregatorPermission],
              }),
            },
          } as Request,
        }),
      ).toBe(ActOnInstitutionValidationErrorReason.GenericError);
    });

    it("returns InvalidInstitutionId if the institution isn't found", async () => {
      expect(
        await validateFunction({
          institutionId: crypto.randomUUID(),
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [aggregatorPermission],
              }),
            },
          } as Request,
        }),
      ).toBe(ActOnInstitutionValidationErrorReason.InvalidInstitutionId);
    });
  });

describe("permissionValidation", () => {
  createValidateInstitutionPermissions({
    adminPermission: UiUserPermissions.UPDATE_INSTITUTION,
    aggregatorPermission: UiUserPermissions.UPDATE_INSTITUTION_AGGREGATOR,
    validateFunction: validateUserCanEditInstitution,
  });

  createValidateInstitutionPermissions({
    adminPermission: UiUserPermissions.DELETE_INSTITUTION,
    aggregatorPermission: UiUserPermissions.DELETE_INSTITUTION_AGGREGATOR,
    validateFunction: validateUserCanDeleteInstitution,
  });

  describe("validateUserCanActOnAggregatorIntegration", () => {
    let mxOnlyInstitutionId: UUID;
    let cleanup: () => Promise<void>;

    beforeAll(async () => {
      const mxOnlyInstitution = await createTestInstitution({
        aggregatorIntegrations: {
          mx: true,
        },
      });
      mxOnlyInstitutionId = mxOnlyInstitution.institution.id as UUID;
      cleanup = mxOnlyInstitution.cleanupInstitution;
    });

    afterAll(async () => {
      await cleanup();
    });

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

    it("returns true if they're an aggregator and are deleting their own integration", async () => {
      const institution = await Institution.findByPk(mxOnlyInstitutionId, {
        include: [
          {
            association: Institution.associations.aggregatorIntegrations,
            attributes: ["id"],
          },
        ],
      });

      expect(
        await validateUserCanDeleteAggregatorIntegration({
          aggregatorIntegrationId: `${institution?.aggregatorIntegrations?.[0]?.id}`,
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [
                  UiUserPermissions.DELETE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR,
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
      ).toBe(ActOnAggregatorIntegrationValidationErrorReason.InsufficientScope);
    });

    it("returns InsufficientScope if they're trying to delete but only have edit permission", async () => {
      expect(
        await validateUserCanDeleteAggregatorIntegration({
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
      ).toBe(ActOnAggregatorIntegrationValidationErrorReason.InsufficientScope);
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
        ActOnAggregatorIntegrationValidationErrorReason.InvalidAggregatorIntegrationId,
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
      ).toBe(ActOnAggregatorIntegrationValidationErrorReason.GenericError);
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
      ).toBe(ActOnAggregatorIntegrationValidationErrorReason.NotYourAggregator);
    });
  });

  describe("getUsersAggregatorIntegrationCreationPermissions", () => {
    let mxOnlyInstitutionId: UUID;
    let cleanup: () => Promise<void>;

    let allAggregatorsInstitutionId: UUID;
    let allAggregatorsCleanup: () => Promise<void>;

    beforeAll(async () => {
      const mxOnlyInstitution = await createTestInstitution({
        aggregatorIntegrations: {
          mx: true,
        },
      });
      mxOnlyInstitutionId = mxOnlyInstitution.institution.id as UUID;
      cleanup = mxOnlyInstitution.cleanupInstitution;

      const allAggregatorsInstitution = await createTestInstitution({
        aggregatorIntegrations: {
          finicity: true,
          mx: true,
          sophtron: true,
        },
      });
      allAggregatorsInstitutionId = allAggregatorsInstitution.institution
        .id as UUID;
      allAggregatorsCleanup = allAggregatorsInstitution.cleanupInstitution;
    });

    afterAll(async () => {
      await cleanup();
      await allAggregatorsCleanup();
    });

    it("returns an array of aggregators with hasAccessToAllAggregators if they are a super admin and there are aggregators without an integration", async () => {
      const response = await getUsersAggregatorIntegrationCreationPermissions({
        institutionId: mxOnlyInstitutionId,
        req: {
          headers: {
            authorization: createTestAuthorization({
              permissions: [UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION],
            }),
          },
        } as Request,
      });

      expect(response.hasAccessToAllAggregators).toBe(true);
      expect(response.aggregatorsThatCanBeAdded.length).toBeGreaterThan(0);
    });

    it("returns an empty array if they are a super admin and there aren't aggregators without an integration", async () => {
      expect(
        await getUsersAggregatorIntegrationCreationPermissions({
          institutionId: allAggregatorsInstitutionId,
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION],
              }),
            },
          } as Request,
        }),
      ).toEqual({
        aggregatorsThatCanBeAdded: [],
        hasAccessToAllAggregators: true,
      });
    });

    it("returns an array of aggregators if they are an aggregator and there isn't an integration for their aggregator", async () => {
      const response = await getUsersAggregatorIntegrationCreationPermissions({
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
      });

      expect(response.hasAccessToAllAggregators).toBeFalsy();
      expect(response.aggregatorsThatCanBeAdded.length).toBeGreaterThan(0);
    });

    it("returns an empty array if they are an aggregator and there is an integration for their aggregator", async () => {
      expect(
        await getUsersAggregatorIntegrationCreationPermissions({
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
      ).toEqual({
        aggregatorsThatCanBeAdded: [],
      });
    });

    it("returns an empty array if they are an aggregator, but they don't have a valid aggregatorName", async () => {
      expect(
        await getUsersAggregatorIntegrationCreationPermissions({
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
      ).toEqual({
        aggregatorsThatCanBeAdded: [],
      });
    });

    it("returns an empty array if they aren't an aggregator or super admin", async () => {
      expect(
        await getUsersAggregatorIntegrationCreationPermissions({
          institutionId: mxOnlyInstitutionId,
          req: {
            headers: {
              authorization: createTestAuthorization({
                permissions: [],
              }),
            },
          } as Request,
        }),
      ).toEqual({
        aggregatorsThatCanBeAdded: [],
      });
    });
  });

  describe("getAggregatorNameFromRequest", () => {
    it("returns the aggregatorName from the request", () => {
      const req = {
        headers: {
          authorization: createTestAuthorization({
            aggregatorId: "sophtron",
            permissions: [],
          }),
        },
      } as Request;

      expect(getAggregatorNameFromRequest(req)).toBe("sophtron");
    });
  });

  describe("getPermissionsFromRequest", () => {
    it("returns the permissions from the request", () => {
      const req = {
        headers: {
          authorization: createTestAuthorization({
            permissions: [
              UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION,
              UiUserPermissions.DELETE_INSTITUTION,
            ],
          }),
        },
      } as Request;

      expect(getPermissionsFromRequest(req)).toEqual([
        UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION,
        UiUserPermissions.DELETE_INSTITUTION,
      ]);
    });
  });
});
