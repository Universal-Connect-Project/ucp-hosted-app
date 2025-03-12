import { UUID } from "crypto";
import { AggregatorIntegration } from "../../models/aggregatorIntegration";
import { Institution } from "../../models/institution";

export const seedInstitutionId = "c14e9877-c1e3-4d3a-b449-585086d14845";
export const secondSeedInstitutionId = "7ad26dbb-78ee-4d06-b67d-bb71c11de653";
export const seedInstitutionName = "Wells Fargo";

export interface InstitutionAttrs {
  id?: UUID;
  name: string;
  keywords: string[];
  logo: string;
  url: string;
  is_test_bank: boolean;
  routing_numbers: string[];
}

export const testInstitution: InstitutionAttrs = {
  name: "Test Bank #1",
  keywords: ["test", "bank"],
  logo: "https://logo.com",
  url: "https://url.com",
  is_test_bank: true,
  routing_numbers: ["123456789", "999999999"],
};

export const cachedInstitutionFromSeed = {
  name: "Wells Fargo",
  is_test_bank: false,
  keywords: ["wells", "fargo"],
  logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867_100x100.png",
  routing_numbers: ["111111111"],
  url: "https://wellsfargo.com",
  sophtron: {
    id: "sophtron_bank",
    supports_aggregation: true,
    supports_history: true,
    supports_identification: true,
    supports_oauth: true,
    supports_verification: true,
    supportsRewards: true,
    supportsBalance: true,
  },
};

export const institutionWithAggregatorQueryObj = {
  dataValues: {
    name: "Wells Fargo",
    is_test_bank: false,
    keywords: ["wells", "fargo"],
    logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867_100x100.png",
    routing_numbers: ["111111111"],
    url: "https://wellsfargo.com",
  },
  aggregatorIntegrations: [
    {
      dataValues: {
        id: "sophtron_bank",
        supports_aggregation: true,
        supports_history: true,
        supports_identification: true,
        supports_oauth: true,
        supports_verification: true,
        supportsRewards: true,
        supportsBalance: true,
      },
      aggregator: {
        name: "sophtron",
      },
    } as unknown as AggregatorIntegration,
  ],
} as unknown as Institution;
