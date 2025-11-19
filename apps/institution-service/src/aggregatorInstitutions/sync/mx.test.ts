import { http, HttpResponse } from "msw";
import {
  FETCH_MX_INSTITUTIONS_URL,
  mapMXInstitution,
  syncMXInstitutions,
} from "./mx";
import { generateSyncAggregatorInstitutionsTests } from "./test/generateSyncAggregatorInstitutionsTests";
import { server } from "../../test/testServer";
import {
  mxInstitutionsPage1,
  mxInstitutionsPage1Limited,
  mxInstitutionsPage2,
  mxInstitutionsPage2Limited,
} from "../../test/testData/mxInstitutions";
import { AggregatorInstitution } from "../../models/aggregatorInstitution";
import * as environment from "../../shared/environment";
import { E2E_LIMIT_SYNC_REQUESTS_ERROR } from "./utils";

const extraInstitutions = new Array(21).fill(null).map((_, index) => ({
  ...mxInstitutionsPage1.institutions[0],
  code: `mxTesting${index}`,
}));

const hiddenInstitution = {
  ...mxInstitutionsPage1.institutions[0],
  code: "shouldntAppear",
  is_hidden: true,
};

describe("MX institution syncing", () => {
  describe("mapMXInstitution", () => {
    it("maps an MX institution to an AggregatorInstitution correctly", () => {
      const firstMXInstitution = {
        code: "mxTestCode",
        name: "MX Test Institution",
        is_hidden: false,
        supported_products: [
          "account_verification",
          "transaction_history",
        ] as string[],
        supports_oauth: true,
        url: "test",
      };

      const mappedInstitution = mapMXInstitution(firstMXInstitution);

      expect(mappedInstitution).toEqual({
        id: firstMXInstitution.code,
        name: firstMXInstitution.name,
        supportsAccountNumber: true,
        supportsAccountOwner: false,
        supportsBalance: false,
        supportsOAuth: true,
        supportsRewards: false,
        supportsTransactions: false,
        supportsTransactionHistory: true,
        url: firstMXInstitution.url,
      });

      const secondMXInstitution = {
        code: "mxTestCode",
        name: "MX Test Institution",
        is_hidden: false,
        supported_products: [
          "identity_verification",
          "transactions",
        ] as string[],
        supports_oauth: false,
        url: "test",
      };

      const secondMappedInstitution = mapMXInstitution(secondMXInstitution);

      expect(secondMappedInstitution).toEqual({
        id: secondMXInstitution.code,
        name: secondMXInstitution.name,
        supportsAccountNumber: false,
        supportsAccountOwner: true,
        supportsBalance: false,
        supportsOAuth: false,
        supportsRewards: false,
        supportsTransactions: true,
        supportsTransactionHistory: false,
        url: secondMXInstitution.url,
      });
    });
  });

  it("reduces the page size, only fetches 2 pages, and filters by capital when e2eLimitRequests is true", async () => {
    jest.spyOn(environment, "getConfig").mockReturnValue({
      E2E_LIMIT_SYNC_REQUESTS: true,
    });

    await syncMXInstitutions({ e2eLimitRequests: true });

    const allAggregatorInstitutionIds = (
      await AggregatorInstitution.findAll()
    ).map((inst) => inst.id);

    const expectedInstitutionIds = [
      ...mxInstitutionsPage1Limited.institutions,
      ...mxInstitutionsPage2Limited.institutions,
    ]
      .map(mapMXInstitution)
      .map((inst) => inst.id);

    expectedInstitutionIds.forEach((id) => {
      expect(allAggregatorInstitutionIds).toContain(id);
    });
  });

  it("throws an error if e2eLimitRequests is true and and its not set on the server", async () => {
    jest.spyOn(environment, "getConfig").mockReturnValue({});

    await expect(
      syncMXInstitutions({ e2eLimitRequests: true }),
    ).rejects.toThrow(E2E_LIMIT_SYNC_REQUESTS_ERROR);
  });

  generateSyncAggregatorInstitutionsTests({
    aggregatorName: "mx",
    expectedFetchError: "Failed to fetch institutions from MX: Bad Request",
    expectedInstitutions: [
      ...mxInstitutionsPage1.institutions,
      mxInstitutionsPage2.institutions[0],
      ...extraInstitutions,
      // This doesn't include the hidden institutions
    ].map(mapMXInstitution),
    setupServerForFailure: () => {
      server.use(
        http.get(
          FETCH_MX_INSTITUTIONS_URL,
          () => new HttpResponse(null, { status: 400 }),
        ),
      );
    },
    setupServerForSuccess: () => {
      server.use(
        http.get(FETCH_MX_INSTITUTIONS_URL, ({ request }) => {
          const url = new URL(request.url);
          const page = url.searchParams.get("page");

          if (page === "2") {
            return HttpResponse.json({
              ...mxInstitutionsPage2,
              institutions: [
                ...mxInstitutionsPage2.institutions,
                ...extraInstitutions,
                hiddenInstitution,
              ],
            });
          }

          return HttpResponse.json(mxInstitutionsPage1);
        }),
      );
    },
    syncAggregatorInstitutions: syncMXInstitutions,
  });
});
