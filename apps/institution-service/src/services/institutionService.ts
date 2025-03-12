import { Institution } from "../models/institution";
import {
  CachedInstitution,
  InstitutionAggregator,
} from "../tasks/loadInstitutionsFromJson";

type aggregatorKey = "mx" | "sophtron" | "finicity";

export function transformInstitutionToCachedInstitution(
  institution: Institution,
) {
  const { aggregatorIntegrations, dataValues } = institution;

  const { id, keywords, logo, url, is_test_bank, routing_numbers, name } =
    dataValues;
  const institutionObj = {
    name,
    id,
    keywords,
    logo,
    url,
    is_test_bank,
    routing_numbers,
  } as CachedInstitution;

  aggregatorIntegrations?.forEach((aggregatorIntegration) => {
    const { aggregator, dataValues } = aggregatorIntegration;
    const {
      id,
      supports_aggregation,
      supports_history,
      supports_identification,
      supports_oauth,
      supports_verification,
      supportsRewards,
      supportsBalance,
    } = dataValues;
    institutionObj[aggregator?.name as aggregatorKey] = {
      id,
      supports_aggregation,
      supports_history,
      supports_identification,
      supports_oauth,
      supports_verification,
      supportsRewards,
      supportsBalance,
    } as unknown as InstitutionAggregator;
  });
  return institutionObj;
}
