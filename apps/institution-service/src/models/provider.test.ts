import { Provider } from "./provider";

describe("Provider Model", () => {
  it("should create a provider", async () => {
    const providerAttributes = {
      name: "mx",
      supports_oauth: true,
      supports_history: true,
      institution_id: "123",
      provider_institution_id: "mx_oauth_bank",
    };

    const createdProvider = await Provider.create(providerAttributes);

    expect(createdProvider).toHaveProperty("id");
    expect(createdProvider.name).toBe(providerAttributes.name);
    expect(createdProvider.isActive).toBeTruthy();
    expect(createdProvider.supports_oauth).toBeTruthy();
    expect(createdProvider.supports_identification).toBeFalsy();
    expect(createdProvider.supports_verification).toBeFalsy();
    expect(createdProvider.supports_aggregation).toBeTruthy();
    expect(createdProvider.supports_history).toBeTruthy();
    expect(createdProvider.institution_id).toBeUndefined();

    // db cleanup
    void createdProvider.destroy();
  });
});
