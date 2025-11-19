import * as config from "../../shared/environment";
import {
  FETCH_FINICITY_ACCESS_TOKEN_URL,
  FETCH_FINICITY_INSTITUTIONS_URL,
  mapFinicityInstitution,
  syncFinicityInstitutions,
} from "./finicity";
import { server } from "../../test/testServer";
import { http, HttpResponse } from "msw";
import { fakeEnvironment } from "../../test/testData/environment";
import {
  finicityInstitutionsPage1,
  finicityInstitutionsPage2,
} from "../../test/testData/finicityInstitutions";
import { generateSyncAggregatorInstitutionsTests } from "./test/generateSyncAggregatorInstitutionsTests";

const modifiedPage2Institutions = [
  ...finicityInstitutionsPage2.institutions,
  ...new Array(21).fill(null).map((_, index) => ({
    ...finicityInstitutionsPage2.institutions[0],
    id: index + 5,
  })),
];

describe("finicity institutions", () => {
  describe("syncFinicityInstitutions", () => {
    generateSyncAggregatorInstitutionsTests({
      aggregatorName: "finicity",
      expectedFetchError:
        "Failed to fetch institutions from Finicity: Bad Request",
      expectedInstitutions: [
        ...finicityInstitutionsPage1.institutions,
        ...modifiedPage2Institutions,
      ].map(mapFinicityInstitution),
      setupServerForFailure: () => {
        server.use(
          http.get(
            FETCH_FINICITY_INSTITUTIONS_URL,
            () => new HttpResponse(null, { status: 400 }),
          ),
        );
      },
      setupServerForSuccess: () => {
        server.use(
          http.get(FETCH_FINICITY_INSTITUTIONS_URL, ({ request }) => {
            const url = new URL(request.url);
            const start = url.searchParams.get("start");

            if (start === "2") {
              return HttpResponse.json({
                ...finicityInstitutionsPage2,
                institutions: [...modifiedPage2Institutions],
              });
            }

            return HttpResponse.json(finicityInstitutionsPage1);
          }),
        );
      },
      syncAggregatorInstitutions: syncFinicityInstitutions,
    });

    it("throws an error if fetching an access token fails", async () => {
      jest.spyOn(config, "getConfig").mockReturnValue(fakeEnvironment);

      server.use(
        http.post(
          FETCH_FINICITY_ACCESS_TOKEN_URL,
          () => new HttpResponse(null, { status: 400 }),
        ),
      );

      await expect(() => syncFinicityInstitutions()).rejects.toThrow(
        "Failed to authenticate with Finicity: Bad Request",
      );
    });

    it("throws an error if configuration is missing", async () => {
      jest.spyOn(config, "getConfig").mockReturnValue({
        FINICITY_APP_KEY: undefined,
        FINICITY_PARTNER_ID: "fakeId",
      } as unknown as config.Config);

      await expect(() => syncFinicityInstitutions()).rejects.toThrow(
        "Missing Finicity environment variables",
      );
    });
  });
});
