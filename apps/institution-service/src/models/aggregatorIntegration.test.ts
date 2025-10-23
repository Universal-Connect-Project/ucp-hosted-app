import { AggregatorIntegration } from "./aggregatorIntegration";
import { Institution } from "./institution";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";
import { CreationAttributes } from "sequelize";

describe("AggregatorIntegration Model", () => {
  let aggregatorId: number;
  let testInstitution: Institution;
  let requiredBody: Record<string, unknown>;

  beforeAll(async () => {
    aggregatorId = (await getAggregatorByName("mx")).id;
  });

  beforeEach(async () => {
    testInstitution = await Institution.create({
      is_test_bank: true,
      keywords: [],
      logo: "test",
      name: "Test Institution for Unique Constraint",
      url: "http://www.testinstitutionunique.com",
    });

    requiredBody = {
      aggregatorId,
      aggregator_institution_id: "mx_oauth_bank",
      institution_id: testInstitution.id,
    };
  });

  afterEach(async () => {
    await testInstitution.destroy({ force: true });
  });

  it("should create an aggregator integration", async () => {
    const aggregatorAttributes = {
      aggregatorId,
      supports_oauth: true,
      supports_history: true,
      institution_id: testInstitution.id,
      aggregator_institution_id: "mx_oauth_bank",
    };

    const aggregatorIntegration =
      await AggregatorIntegration.create(aggregatorAttributes);
    expect(aggregatorIntegration).toHaveProperty("id");
    expect(aggregatorIntegration.isActive).toBeTruthy();
    expect(aggregatorIntegration.supports_oauth).toBeTruthy();
    expect(aggregatorIntegration.supports_identification).toBeFalsy();
    expect(aggregatorIntegration.supports_verification).toBeFalsy();
    expect(aggregatorIntegration.supports_aggregation).toBeTruthy();
    expect(aggregatorIntegration.supports_history).toBeTruthy();
    expect(aggregatorIntegration.supportsRewards).toBeFalsy();
    expect(aggregatorIntegration.supportsBalance).toBeFalsy();
    expect(aggregatorIntegration.institution_id).toBe(testInstitution.id);
    expect(aggregatorIntegration.aggregatorId).toBe(aggregatorId);

    void aggregatorIntegration.destroy();
  });

  it("fails if required fields are missing", async () => {
    for (const key of Object.keys(requiredBody)) {
      const invalidAttributes: Record<string, unknown> = {
        ...requiredBody,
      };

      delete invalidAttributes[key];

      await expect(
        AggregatorIntegration.create(
          invalidAttributes as CreationAttributes<AggregatorIntegration>,
        ),
      ).rejects.toThrow();
    }
  });

  it("fails if an invalid aggregatorId is provided", async () => {
    await expect(
      AggregatorIntegration.create({
        ...requiredBody,
        aggregatorId: 999999,
      } as CreationAttributes<AggregatorIntegration>),
    ).rejects.toThrow();
  });

  it("fails if an invalid institution_id is provided", async () => {
    await expect(
      AggregatorIntegration.create({
        ...requiredBody,
        institution_id: crypto.randomUUID(),
      } as CreationAttributes<AggregatorIntegration>),
    ).rejects.toThrow();
  });

  it("should not allow more than one of the same aggregatorIntegration per aggregator per institution", async () => {
    const firstAggregatorIntegration = await AggregatorIntegration.create(
      requiredBody as CreationAttributes<AggregatorIntegration>,
    );

    await expect(
      AggregatorIntegration.create(
        requiredBody as CreationAttributes<AggregatorIntegration>,
      ),
    ).rejects.toThrow();

    await firstAggregatorIntegration.destroy();
  });
});
