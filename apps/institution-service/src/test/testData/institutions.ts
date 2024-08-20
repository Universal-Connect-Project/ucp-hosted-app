import { Institution } from "../../models/institution";
import { Provider } from "../../models/provider";

export const seedInstitutionId = "UCP-123456789";
export const seedInstitutionName = "Wells Fargo";

export const testInstitution = {
  ucp_id: `UCP-123`,
  name: "Test Bank #1",
  keywords: "test, bank",
  logo: "https://logo.com",
  url: "https://url.com",
  is_test_bank: true,
  routing_numbers: ["123", "324"],
};

export const cachedInstitutionFromSeed = {
  name: "Wells Fargo",
  is_test_bank: false,
  keywords: "wells, fargo",
  logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867_100x100.png",
  routing_numbers: ["123", "456"],
  mx: {
    id: "mx_bank",
    supports_aggregation: true,
    supports_history: true,
    supports_identification: true,
    supports_oauth: true,
    supports_verification: true,
  },
  sophtron: {
    id: "sophtron_bank",
    supports_aggregation: true,
    supports_history: true,
    supports_identification: true,
    supports_oauth: true,
    supports_verification: true,
  },
};

export const institutionWithProviderQueryObj = {
  dataValues: {
    name: "Wells Fargo",
    is_test_bank: false,
    keywords: "wells, fargo",
    logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867_100x100.png",
    routing_numbers: ["123", "456"],
  },
  providers: [
    {
      dataValues: {
        name: "mx",
        id: "mx_bank",
        supports_aggregation: true,
        supports_history: true,
        supports_identification: true,
        supports_oauth: true,
        supports_verification: true,
      },
    } as unknown as Provider,
    {
      dataValues: {
        name: "sophtron",
        id: "sophtron_bank",
        supports_aggregation: true,
        supports_history: true,
        supports_identification: true,
        supports_oauth: true,
        supports_verification: true,
      },
    } as unknown as Provider,
  ],
} as Institution;
