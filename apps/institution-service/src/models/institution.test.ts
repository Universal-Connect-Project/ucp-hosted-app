import { testInstitution } from "../test/testData/institutions";
import { AggregatorIntegration } from "./aggregatorIntegration";
import { Institution } from "./institution";

describe("Institution Model", () => {
  it("should create an institution", async () => {
    const randomString = Math.random().toString(36).slice(2, 7);
    const newInstitutionAttributes = {
      ...testInstitution,
      ucp_id: `UCP-${randomString}`,
    };
    const createdInstitution = await Institution.create(
      newInstitutionAttributes,
    );

    expect(createdInstitution).toHaveProperty("ucp_id");
    expect(createdInstitution.name).toBe(newInstitutionAttributes.name);
    expect(createdInstitution.keywords).toBe(newInstitutionAttributes.keywords);
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
    const randomString = Math.random().toString(36).slice(2, 7);
    const newInstitutionAttributes = {
      ...testInstitution,
      ucp_id: `UCP-${randomString}`,
    };

    const createdInstitution = await Institution.create(
      newInstitutionAttributes,
    );

    expect(createdInstitution).toHaveProperty("ucp_id");

    const mxAggregatorAttributes = {
      supports_oauth: true,
      institution_id: createdInstitution.ucp_id,
      aggregator_institution_id: "mx_oauth_bank",
    };
    const sophtronAggregatorAttributes = {
      supports_oauth: true,
      institution_id: createdInstitution.ucp_id,
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
