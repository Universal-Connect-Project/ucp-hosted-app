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
  mxInstitutionsPage2,
} from "../../test/testData/mxInstitutions";

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
