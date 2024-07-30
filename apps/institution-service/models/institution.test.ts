// import { Institution } from "./institution";
import { Institution } from "./institution";
import { Provider } from "./provider";

const institutionAttributes = {
  ucp_id: `UCP-123`,
  name: "Test Bank #1",
  keywords: "test, bank",
  logo: "https://logo.com",
  url: "https://url.com",
  is_test_bank: true,
  routing_numbers: ["123", "324"],
};

describe("Institution Model", () => {
  it("should create an institution", async () => {
    const randomString = Math.random().toString(36).slice(2, 7);
    const newInstitutionAttributes = {
      ...institutionAttributes,
      ucp_id: `UCP-${randomString}`,
    };
    const createdInstitution = await Institution.create(
      newInstitutionAttributes
    );

    expect(createdInstitution).toHaveProperty("ucp_id");
    expect(createdInstitution.name).toBe(newInstitutionAttributes.name);
    expect(createdInstitution.keywords).toBe(newInstitutionAttributes.keywords);
    expect(createdInstitution.logo).toBe(newInstitutionAttributes.logo);
    expect(createdInstitution.url).toBe(newInstitutionAttributes.url);
    expect(createdInstitution.is_test_bank).toBeTruthy();
    expect(createdInstitution.routing_numbers).toStrictEqual(
      newInstitutionAttributes.routing_numbers
    );

    // db cleanup
    void createdInstitution.destroy();
  });

  it("should have associated providers", async () => {
    const randomString = Math.random().toString(36).slice(2, 7);
    const newInstitutionAttributes = {
      ...institutionAttributes,
      ucp_id: `UCP-${randomString}`,
    };

    const createdInstitution = await Institution.create(
      newInstitutionAttributes
    );

    expect(createdInstitution).toHaveProperty("ucp_id");

    const mxProviderAttributes = {
      name: "mx",
      supports_oauth: true,
      institution_id: createdInstitution.ucp_id,
    };
    const sophtronProviderAttributes = {
      name: "sophtron",
      supports_oauth: true,
      institution_id: createdInstitution.ucp_id,
    };

    const provider1 = await Provider.create(mxProviderAttributes);
    const provier2 = await Provider.create(sophtronProviderAttributes);

    const institutionProviders = await createdInstitution.getProviders();

    expect(institutionProviders).toHaveLength(2);

    // db cleanup
    void createdInstitution.destroy();
    void provider1.destroy();
    void provier2.destroy();
  });
});
