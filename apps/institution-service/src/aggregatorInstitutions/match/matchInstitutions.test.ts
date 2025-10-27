import { AggregatorInstitution } from "../../models/aggregatorInstitution";
import { AggregatorIntegration } from "../../models/aggregatorIntegration";
import { Institution } from "../../models/institution";
import { getAggregatorByName } from "../../shared/aggregators/getAggregatorByName";
import { createTestInstitution } from "../../test/createTestInstitution";
import { matchInstitutions } from "./matchInstitutions";

describe("matchInstitutions", () => {
  beforeEach(async () => {
    await Institution.truncate({ cascade: true });
    await AggregatorInstitution.truncate({ force: true });
    await AggregatorIntegration.truncate({ force: true });
  });

  afterEach(async () => {
    await Institution.truncate({ cascade: true });
    await AggregatorInstitution.truncate({ force: true });
    await AggregatorIntegration.truncate({ force: true });
  });

  it("creates aggregator integrations for institutions with similar names and urls", async () => {
    const { institution: institution1 } = await createTestInstitution({
      institution: {
        name: "Star Wars Episode 1: The Phantom Bank",
        url: "https://www.starwarsepisode1thephantonbank.com",
      },
    });

    const { institution: institution2 } = await createTestInstitution({
      institution: {
        name: "Harry Potter and the Bank of Azkaban",
        url: "https://www.harrypotterandthebankofazkaban.com",
      },
    });

    const mxAggregatorId = (await getAggregatorByName("mx")).id;
    const testBankAggregatorInstitution = await AggregatorInstitution.create({
      id: "1",
      aggregatorId: mxAggregatorId,
      name: "Star Wars Episode 1: The Phantom Bankz",
      url: "https://www.starwarsepisode1thephantonbankz.com",
    });

    const institution2AggregatorInstitution =
      await AggregatorInstitution.create({
        id: "2",
        aggregatorId: mxAggregatorId,
        name: "Harry Potter and the Bank of Azkabanz",
        url: "https://www.harrypotterandthebankofazkabanz.com",
      });

    await matchInstitutions(mxAggregatorId);

    const institution1AggregatorIntegrations =
      await institution1.getAggregatorIntegrations();

    expect(institution1AggregatorIntegrations).toHaveLength(1);
    expect(
      institution1AggregatorIntegrations[0].aggregator_institution_id,
    ).toBe(testBankAggregatorInstitution.id);

    const institution2AggregatorIntegrations =
      await institution2.getAggregatorIntegrations();
    expect(institution2AggregatorIntegrations).toHaveLength(1);
    expect(
      institution2AggregatorIntegrations[0].aggregator_institution_id,
    ).toBe(institution2AggregatorInstitution.id);
  });

  it("doesn't create more than 1 aggregator integration for the same institution even if it would normally match", async () => {
    const { institution } = await createTestInstitution({
      institution: {
        name: "Test",
        url: "https://www.test.com",
      },
    });

    const mxAggregatorId = (await getAggregatorByName("mx")).id;

    const aggregatorInstitutionProps = {
      aggregatorId: mxAggregatorId,
      name: "Test",
      url: "https://www.testt.com",
    };

    const aggregatorInstitution1 = await AggregatorInstitution.create({
      ...aggregatorInstitutionProps,
      id: "1",
    });

    await AggregatorInstitution.create({
      ...aggregatorInstitutionProps,
      id: "2",
    });

    await matchInstitutions(mxAggregatorId);

    const institution1AggregatorIntegrations =
      await institution.getAggregatorIntegrations();

    expect(await AggregatorIntegration.count()).toBe(1);

    expect(institution1AggregatorIntegrations).toHaveLength(1);
    expect(
      institution1AggregatorIntegrations[0].aggregator_institution_id,
    ).toBe(aggregatorInstitution1.id);
  });

  it("doesn't create aggregator integrations for institutions with dissimilar names and urls", async () => {
    const { institution } = await createTestInstitution({
      institution: {
        name: "Completely Different Bank",
        url: "https://www.completelydifferentbank.com",
      },
    });

    const mxAggregatorId = (await getAggregatorByName("mx")).id;
    await AggregatorInstitution.create({
      id: "1",
      aggregatorId: mxAggregatorId,
      name: "Some Other Bank",
      url: "https://www.someotherbank.com",
    });

    await matchInstitutions(mxAggregatorId);

    const institutionAggregatorIntegrations =
      institution.getAggregatorIntegrations();

    expect(await institutionAggregatorIntegrations).toHaveLength(0);
  });
});
