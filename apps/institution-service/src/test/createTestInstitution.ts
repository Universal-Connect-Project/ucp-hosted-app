import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { Institution } from "../models/institution";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";

type AggregatorIntegrationOption = Partial<AggregatorIntegration> | boolean;

interface CreateTestInstitutionProps {
  aggregatorIntegrations?: Record<string, AggregatorIntegrationOption>;
  institution?: Partial<Institution>;
}

export const createTestInstitution = async ({
  aggregatorIntegrations = {},
  institution: institutionOverrides = {},
}: CreateTestInstitutionProps) => {
  const institution = await Institution.create({
    name: "Wells Fargo",
    is_test_bank: false,
    keywords: ["wells", "fargo"],
    logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867_100x100.png",
    routing_numbers: ["111111111"],
    url: "https://wellsfargo.com",
    ...institutionOverrides,
  });

  const createdAggregatorIntegrations: Record<string, AggregatorIntegration> =
    {};

  for (const [aggregatorName, option] of Object.entries(
    aggregatorIntegrations,
  )) {
    const aggregatorId = (await getAggregatorByName(aggregatorName)).id;

    createdAggregatorIntegrations[aggregatorName] =
      await AggregatorIntegration.create({
        aggregatorId,
        aggregator_institution_id: `${aggregatorName}_bank`,
        institution_id: institution.id,
        isActive: true,
        ...(typeof option === "object" ? option : {}),
      });
  }

  const cleanupInstitution = async () => {
    for (const aggIntegration of Object.values(createdAggregatorIntegrations)) {
      await aggIntegration.destroy();
    }

    await institution.destroy({ force: true });
  };

  return {
    aggregatorIntegrations: createdAggregatorIntegrations,
    cleanupInstitution,
    institution,
  };
};
