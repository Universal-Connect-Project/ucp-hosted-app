import fs from "fs";
import path from "path";
import db from "../database";
import { Institution } from "../models/institution";
import { Provider } from "../models/provider";

export interface CachedInstitution {
  name: string;
  keywords: string;
  logo: string;
  url: string;
  ucp_id: string;
  is_test_bank: boolean;
  routing_numbers: string[];
  mx: InstitutionProvider;
  sophtron: InstitutionProvider;
  finicity: InstitutionProvider;
  akoya: InstitutionProvider;
}

export interface InstitutionProvider {
  id: string;
  supports_oauth: boolean;
  supports_identification: boolean;
  supports_verification: boolean;
  supports_aggregation: boolean;
  supports_history: boolean;
}

async function loadInstitutionData() {
  await db.authenticate();
  const institutions = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../config/ucwInstitutionsMapping.json"),
      "utf8",
    ),
  ) as CachedInstitution[];

  const institutionsList: Institution[] = [];
  const providerList: Provider[] = [];

  institutions.forEach((institution: CachedInstitution) => {
    institutionsList.push({
      ucp_id: institution.ucp_id,
      name: institution.name,
      keywords: institution.keywords,
      url: institution.url,
      logo: institution.logo,
      is_test_bank: institution.is_test_bank,
      routing_numbers: institution.routing_numbers,
    } as Institution);

    if (institution.mx.id) {
      const mx = institution.mx;
      providerList.push({
        name: "mx",
        provider_institution_id: mx.id,
        institution_id: institution.ucp_id,
        supports_oauth: mx.supports_oauth,
        supports_identification: mx.supports_identification,
        supports_verification: mx.supports_verification,
        supports_history: mx.supports_history,
        supports_aggregation: mx.supports_aggregation,
      } as Provider);
    }

    if (institution.sophtron.id) {
      const sophtron = institution.sophtron;
      providerList.push({
        name: "sophtron",
        provider_institution_id: sophtron.id,
        institution_id: institution.ucp_id,
        supports_oauth: sophtron.supports_oauth,
        supports_identification: sophtron.supports_identification,
        supports_verification: sophtron.supports_verification,
        supports_history: sophtron.supports_history,
        supports_aggregation: sophtron.supports_aggregation,
      } as Provider);
    }

    if (institution.finicity.id) {
      const finicity = institution.finicity;
      providerList.push({
        name: "finicity",
        provider_institution_id: finicity.id,
        institution_id: institution.ucp_id,
        supports_oauth: finicity.supports_oauth,
        supports_identification: finicity.supports_identification,
        supports_verification: finicity.supports_verification,
        supports_history: finicity.supports_history,
        supports_aggregation: finicity.supports_aggregation,
      } as Provider);
    }
  });

  try {
    await Institution.bulkCreate(institutionsList);
    console.log("Institution successful");

    await Provider.bulkCreate(providerList);
    console.log("provider transaction successful");
  } catch (error) {
    console.error("Error loading data", error);
  } finally {
    process.exit(0);
  }
}

void loadInstitutionData();

process.on("SIGINT", () => {
  void db.close();
  process.exit(0);
});
