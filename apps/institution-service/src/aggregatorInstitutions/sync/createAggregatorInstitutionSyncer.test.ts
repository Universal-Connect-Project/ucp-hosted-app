import { AggregatorInstitution } from "../../models/aggregatorInstitution";
import { getAggregatorByName } from "../../shared/aggregators/getAggregatorByName";
import {
  createAggregatorInstitutionSyncer,
  FetchAndConvertInstitutionPage,
} from "./createAggregatorInstitutionSyncer";

describe("createAggregatorInstitutionSyncer", () => {
  it("should store institutions from all pages of the aggregator and remove missing aggregatorInstitutions", async () => {
    const finicityAggregatorId = (await getAggregatorByName("finicity")).id;

    const missingInstitution = await AggregatorInstitution.create({
      id: "missing_inst",
      name: "Missing Institution",
      aggregatorId: finicityAggregatorId,
      url: "http://missing.com",
    });

    const firstPageConverted = [
      { id: "inst_1", name: "Institution 1", url: "http://inst1.com" },
      { id: "inst_2", name: "Institution 2", url: "http://inst2.com" },
    ];

    const secondPageConverted = [
      { id: "inst_3", name: "Institution 3", url: "http://inst3.com" },
    ];

    const fetchAndConvertInstitutionPage: FetchAndConvertInstitutionPage =
      // eslint-disable-next-line @typescript-eslint/require-await
      async ({ page }: { page: number }) => {
        if (page === 1) {
          return {
            convertedInstitutions: firstPageConverted,
            totalPages: 2,
          };
        } else {
          return {
            convertedInstitutions: secondPageConverted,
            totalPages: 2,
          };
        }
      };

    const aggregatorInstitutionSyncer = createAggregatorInstitutionSyncer({
      aggregatorName: "finicity",
      fetchAndConvertInstitutionPage,
      minimumValidInstitutionCount: 1,
    });

    await aggregatorInstitutionSyncer({});

    const allInstitutions = await AggregatorInstitution.findAll({
      where: { aggregatorId: finicityAggregatorId },
    });

    expect(allInstitutions.length).toBe(3);

    const institutionIds = allInstitutions.map((inst) => inst.id);
    expect(institutionIds).toContain(firstPageConverted[0].id);
    expect(institutionIds).toContain(firstPageConverted[1].id);
    expect(institutionIds).toContain(secondPageConverted[0].id);

    expect(institutionIds).not.toContain(missingInstitution.id);
  });
});
