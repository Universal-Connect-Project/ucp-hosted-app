import { UUID } from "crypto";
import { seedInstitutionId } from "../test/testData/institutions";
import { AggregatorIntegration } from "./aggregatorIntegration";

describe("AggregatorIntegration Model", () => {
  it("should create an aggregator", async () => {
    const aggregatorAttributes = {
      name: "mx",
      supports_oauth: true,
      supports_history: true,
      institution_id: seedInstitutionId as UUID,
      aggregator_institution_id: "mx_oauth_bank",
    };

    const createdAggregator =
      await AggregatorIntegration.create(aggregatorAttributes);
    expect(createdAggregator).toHaveProperty("id");
    expect(createdAggregator.isActive).toBeTruthy();
    expect(createdAggregator.supports_oauth).toBeTruthy();
    expect(createdAggregator.supports_identification).toBeFalsy();
    expect(createdAggregator.supports_verification).toBeFalsy();
    expect(createdAggregator.supports_aggregation).toBeTruthy();
    expect(createdAggregator.supports_history).toBeTruthy();
    expect(createdAggregator.supportsRewards).toBeFalsy();
    expect(createdAggregator.supportsBalance).toBeFalsy();
    expect(createdAggregator.institution_id).toBe(seedInstitutionId);

    // db cleanup
    void createdAggregator.destroy();
  });
});
