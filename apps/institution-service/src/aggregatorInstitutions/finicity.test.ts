import * as config from "../shared/environment";
import {
  FETCH_FINICITY_ACCESS_TOKEN_URL,
  FETCH_FINICITY_INSTITUTIONS_URL,
  syncFinicityInstitutions,
} from "./finicity";
import { server } from "../test/testServer";
import { http, HttpResponse } from "msw";
import { fakeEnvironment } from "../test/testData/environment";
import {
  finicityInstitutionsPage1,
  finicityInstitutionsPage2,
} from "../test/testData/finicityInstitutions";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";

describe("finicity institutions", () => {
  describe("syncFinicityInstitutions", () => {
    describe("with valid configuration", () => {
      let finicityAggregatorId: number;

      beforeEach(async () => {
        jest.spyOn(config, "getConfig").mockReturnValue(fakeEnvironment);

        await AggregatorInstitution.destroy({ force: true, truncate: true });

        finicityAggregatorId = (await getAggregatorByName("finicity"))?.id;
      });

      it("removes existing aggregatorInstitutions if they aren't in the updated finicity list", async () => {
        const existingAggregatorInstitution =
          await AggregatorInstitution.create({
            aggregatorId: finicityAggregatorId,
            id: "999999",
            name: "Old Institution",
            supportsAccountNumber: false,
            supportsAccountOwner: false,
            supportsBalance: false,
            supportsOAuth: false,
            supportsRewards: false,
            supportsTransactions: false,
            supportsTransactionHistory: false,
            url: "https://www.oldinstitution.com",
          });

        server.use(
          http.get(FETCH_FINICITY_INSTITUTIONS_URL, ({ request }) => {
            const url = new URL(request.url);
            const start = url.searchParams.get("start");

            if (start === "2") {
              return HttpResponse.json({
                ...finicityInstitutionsPage2,
                institutions: new Array(5000).fill(null).map((_, index) => ({
                  accountOwner: true,
                  ach: false,
                  aha: true,
                  availBalance: false,
                  id: `finicityTesting${index}`,
                  name: "Bank of Testing",
                  oauthEnabled: true,
                  transAgg: false,
                  urlHomeApp: "https://www.bankoftesting.com",
                })),
              });
            }

            return HttpResponse.json(finicityInstitutionsPage1);
          }),
        );

        expect(
          await AggregatorInstitution.findOne({
            where: { id: existingAggregatorInstitution.id },
          }),
        ).not.toBeNull();

        await syncFinicityInstitutions();

        expect(
          await AggregatorInstitution.findOne({
            where: { id: existingAggregatorInstitution.id },
          }),
        ).toBeNull();
      }, 20000);

      it("fetches all pages of institutions from Finicity, stores them in the database, when run again it updates the existing records", async () => {
        expect(finicityAggregatorId).toBeDefined();

        const expectedInstitutions = [
          ...finicityInstitutionsPage1.institutions,
          ...finicityInstitutionsPage2.institutions,
        ];

        await syncFinicityInstitutions();

        for (const institution of expectedInstitutions) {
          const storedInstitution = await AggregatorInstitution.findOne({
            where: {
              aggregatorId: finicityAggregatorId,
              id: institution.id.toString(),
            },
            raw: true,
          });

          expect(storedInstitution!.name).toBe(institution.name);
          expect(storedInstitution!.url).toBe(institution.urlHomeApp);
          expect(storedInstitution!.supportsAccountOwner).toBe(
            institution.accountOwner,
          );
          expect(storedInstitution!.supportsAccountNumber).toBe(
            institution.ach,
          );
          expect(storedInstitution!.supportsBalance).toBe(
            institution.availBalance,
          );
          expect(storedInstitution!.supportsOAuth).toBe(
            institution.oauthEnabled,
          );
          expect(storedInstitution!.supportsTransactions).toBe(
            institution.transAgg,
          );
        }
      });

      it("throws an error if fetching an access token fails", async () => {
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

      it("throws an error if fetching institutions fails", async () => {
        server.use(
          http.get(
            FETCH_FINICITY_INSTITUTIONS_URL,
            () => new HttpResponse(null, { status: 400 }),
          ),
        );

        await expect(() => syncFinicityInstitutions()).rejects.toThrow(
          "Failed to fetch institutions from Finicity: Bad Request",
        );
      });
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
