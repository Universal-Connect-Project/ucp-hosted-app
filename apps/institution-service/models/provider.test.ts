import { Institution } from "./institution";
import { Provider } from "./provider";

describe("Provider Model", () => {
  it("should create a provider", async () => {
    const providerData = {
      name: "mx",
      supports_oauth: true,
      institution_id: "UCP-123",
    };

    const createdProvider = await Provider.create(providerData);

    expect(createdProvider).toHaveProperty("id");
    expect(createdProvider.name).toBe(providerData.name);
  });

  it("should handle associations", async () => {
    const institutionData = {
      ucp_id: "UCP-123",
      name: "test bank",
      logo: "nothing",
      url: "nothing",
      keywords: "hi",
      is_test_bank: false,
      is_hidden: false,
      routing_numbers: [],
    };

    const institution = await Institution.create(institutionData);
    const providerData = {
      name: "mx",
      institution_id: institution.ucp_id,
    };

    const createdProvider = await Provider.create(providerData);

    expect(createdProvider.institution_id).toBe(institution.ucp_id);

    expect(institution.getProviders()).toContain(createdProvider);
  });
});
