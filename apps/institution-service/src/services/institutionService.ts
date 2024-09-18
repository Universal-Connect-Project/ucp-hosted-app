import { Institution } from "../models/institution";
import {
  CachedInstitution,
  InstitutionProvider,
} from "../tasks/loadInstitutionsFromJson";

type providerKey = "mx" | "sophtron" | "finicity";

export function transformInstitutionToCachedInstitution(
  institution: Institution,
) {
  const { providerIntegrations, dataValues } = institution;

  const { ucp_id, keywords, logo, url, is_test_bank, routing_numbers } =
    dataValues;
  const institutionObj = {
    ucp_id,
    keywords,
    logo,
    url,
    is_test_bank,
    routing_numbers,
  } as CachedInstitution;

  providerIntegrations?.forEach((providerIntegration) => {
    const { provider, dataValues } = providerIntegration;
    const {
      id,
      supports_aggregation,
      supports_history,
      supports_identification,
      supports_oauth,
      supports_verification,
    } = dataValues;
    institutionObj[provider?.name as providerKey] = {
      id,
      supports_aggregation,
      supports_history,
      supports_identification,
      supports_oauth,
      supports_verification,
    } as unknown as InstitutionProvider;
  });
  return institutionObj;
}
