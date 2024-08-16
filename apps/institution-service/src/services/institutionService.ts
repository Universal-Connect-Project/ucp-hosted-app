import { Institution } from "../models/institution";
import {
  CachedInstitution,
  InstitutionProvider,
} from "../tasks/loadInstitutionsFromJson";

type providerKey = "mx" | "sophtron" | "finicity";

export function transformInstitutionToCachedInstitution(
  institution: Institution,
) {
  const { providers, dataValues } = institution;
  const { ucp_id, name, keywords, logo, url, is_test_bank, routing_numbers } =
    dataValues;
  const institutionObj = {
    ucp_id,
    name,
    keywords,
    logo,
    url,
    is_test_bank,
    routing_numbers,
  } as CachedInstitution;

  providers?.forEach((provider) => {
    const { name, ...providerAttrs } = provider.dataValues;
    institutionObj[name as providerKey] =
      providerAttrs as unknown as InstitutionProvider;
  });
  return institutionObj;
}
