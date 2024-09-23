import { UUID } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { testInstitution } from "../test/testData/institutions";
import { AggregatorIntegration } from "./aggregatorIntegration";
import { Institution } from "./institution";

describe("Institution Model", () => {
  it("should create an institution", async () => {
    const newInstitutionAttributes = {
      ...testInstitution,
      id: uuidv4() as UUID,
    };
    const createdInstitution = await Institution.create(
      newInstitutionAttributes,
    );

    expect(createdInstitution).toHaveProperty("id");
    expect(createdInstitution.name).toBe(newInstitutionAttributes.name);
    expect(createdInstitution.keywords).toStrictEqual(
      newInstitutionAttributes.keywords,
    );
    expect(createdInstitution.logo).toBe(newInstitutionAttributes.logo);
    expect(createdInstitution.url).toBe(newInstitutionAttributes.url);
    expect(createdInstitution.is_test_bank).toBeTruthy();
    expect(createdInstitution.routing_numbers).toStrictEqual(
      newInstitutionAttributes.routing_numbers,
    );

    // db cleanup
    void createdInstitution.destroy();
  });

  it("should have associated aggregators", async () => {
    const newInstitutionAttributes = {
      ...testInstitution,
      id: uuidv4() as UUID,
    };

    const createdInstitution = await Institution.create(
      newInstitutionAttributes,
    );

    expect(createdInstitution).toHaveProperty("id");

    const mxAggregatorAttributes = {
      supports_oauth: true,
      institution_id: createdInstitution.id,
      aggregator_institution_id: "mx_oauth_bank",
    };
    const sophtronAggregatorAttributes = {
      supports_oauth: true,
      institution_id: createdInstitution.id,
      aggregator_institution_id: "sophtron-1234",
    };

    const aggregator1 = await AggregatorIntegration.create(
      mxAggregatorAttributes,
    );
    const aggregator2 = await AggregatorIntegration.create(
      sophtronAggregatorAttributes,
    );

    const institutionAggregators =
      await createdInstitution.getAggregatorIntegrations();

    expect(institutionAggregators).toHaveLength(2);

    // db cleanup
    void createdInstitution.destroy();
    void aggregator1.destroy();
    void aggregator2.destroy();
  });
});
