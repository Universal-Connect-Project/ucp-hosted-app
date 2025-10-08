import * as config from "../shared/environment";
import {
  mapFinicityInstitution,
  FETCH_FINICITY_ACCESS_TOKEN_URL,
  FETCH_FINICITY_INSTITUTIONS_URL,
  fetchFinicityInstitutions,
} from "./finicity";
import { server } from "../test/testServer";
import { http, HttpResponse } from "msw";
import { fakeEnvironment } from "../test/testData/environment";
import {
  finicityInstitutionsPage1,
  finicityInstitutionsPage2,
} from "../test/testData/finicityInstitutions";
import { Aggregator } from "../models/aggregator";

describe("finicity institutions", () => {
  describe("fetchFinicityInstitutions", () => {
    describe("with valid configuration", () => {
      beforeEach(() => {
        jest.spyOn(config, "getConfig").mockReturnValue(fakeEnvironment);
      });

      it("fetches institutions from Finicity, maps them, and stitches the pages together", async () => {
        const finicityAggregatorId = (
          await Aggregator.findOne({
            where: { name: "finicity" },
            raw: true,
          })
        )?.id as number;

        expect(finicityAggregatorId).toBeDefined();

        expect(await fetchFinicityInstitutions()).toEqual(
          [
            ...finicityInstitutionsPage1.institutions,
            ...finicityInstitutionsPage2.institutions,
          ].map(mapFinicityInstitution),
        );
      });

      it("throws an error if fetching an access token fails", async () => {
        server.use(
          http.post(
            FETCH_FINICITY_ACCESS_TOKEN_URL,
            () => new HttpResponse(null, { status: 400 }),
          ),
        );

        await expect(() => fetchFinicityInstitutions()).rejects.toThrow(
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

        await expect(() => fetchFinicityInstitutions()).rejects.toThrow(
          "Failed to fetch institutions from Finicity: Bad Request",
        );
      });
    });

    it("throws an error if configuration is missing", async () => {
      jest.spyOn(config, "getConfig").mockReturnValue({
        FINICITY_APP_KEY: undefined,
        FINICITY_PARTNER_ID: "fakeId",
      } as unknown as config.Config);

      await expect(() => fetchFinicityInstitutions()).rejects.toThrow(
        "Missing Finicity environment variables",
      );
    });
  });
});
