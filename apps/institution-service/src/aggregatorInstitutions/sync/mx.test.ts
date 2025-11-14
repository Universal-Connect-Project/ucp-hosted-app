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
