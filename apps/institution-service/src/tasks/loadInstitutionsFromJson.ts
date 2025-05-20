import fs from "fs";
import path from "path";
import db from "../database";
import { Aggregator } from "../models/aggregator";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { defineAssociations } from "../models/associations";
import { Institution } from "../models/institution";
import { mxAggregatorId } from "../test/testData/aggregators";

export interface CachedInstitution {
  name: string;
  keywords: string[];
  logo: string;
  url: string;
  id: string;
  is_test_bank: boolean;
  routing_numbers: string[];
  mx?: InstitutionAggregator;
  sophtron?: InstitutionAggregator;
  finicity?: InstitutionAggregator;
  akoya?: InstitutionAggregator;
}

export interface InstitutionAggregator {
  id: string;
  isActive: boolean;
  supports_oauth: boolean;
  supports_identification: boolean;
  supports_verification: boolean;
  supports_aggregation: boolean;
  supports_history: boolean;
  supportsRewards: boolean;
  supportsBalance: boolean;
}

async function loadInstitutionData() {
  await db.authenticate().then(() => {
    defineAssociations();
  });

  const institutions = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../config/ucwInstitutionsMapping.json"),
      "utf8",
    ),
  ) as CachedInstitution[];

  const institutionsList: Institution[] = [];
  const aggregatorList: AggregatorIntegration[] = [];
  const [mxAggregator, _mxCreated] = await Aggregator.findOrCreate({
    where: {
      name: "mx",
      displayName: "MX",
      logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-3aeb38da-26e4-3818-e0fa-673315ab7754_100x100.png",
      id: mxAggregatorId,
    },
  });
  const [sophtronAggregator, _sophtronCreated] = await Aggregator.findOrCreate({
    where: {
      name: "sophtron",
      displayName: "Sophtron",
      logo: "https://sophtron.com/Images/logo.png",
    },
  });
  const [finicityAggregator, _finicityCreated] = await Aggregator.findOrCreate({
    where: {
      name: "finicity",
      displayName: "Finicity",
      logo: "https://universalconnectproject.org/images/ucp-logo-icon.svg",
    },
  });

  institutions.forEach((institution: CachedInstitution) => {
    institutionsList.push({
      id: institution.id,
      name: institution.name,
      keywords: institution.keywords,
      url: institution.url,
      logo: institution.logo,
      is_test_bank: institution.is_test_bank,
      routing_numbers: institution.routing_numbers,
    } as Institution);

    if (institution?.mx?.id) {
      const mx = institution.mx;

      aggregatorList.push({
        isActive: mx.isActive ?? true,
        aggregatorId: mxAggregator?.id,
        aggregator_institution_id: mx.id,
        institution_id: institution.id,
        supports_oauth: mx.supports_oauth,
        supports_identification: mx.supports_identification,
        supports_verification: mx.supports_verification,
        supports_history: mx.supports_history,
        supportsRewards: mx.supportsRewards,
        supportsBalance: mx.supportsBalance,
        supports_aggregation: mx.supports_aggregation,
      } as AggregatorIntegration);
    }

    if (institution?.sophtron?.id) {
      const sophtron = institution.sophtron;

      aggregatorList.push({
        isActive: sophtron.isActive ?? true,
        aggregatorId: sophtronAggregator?.id,
        aggregator_institution_id: sophtron.id,
        institution_id: institution.id,
        supports_oauth: sophtron.supports_oauth,
        supports_identification: sophtron.supports_identification,
        supports_verification: sophtron.supports_verification,
        supports_history: sophtron.supports_history,
        supportsRewards: sophtron.supportsRewards,
        supportsBalance: sophtron.supportsBalance,
        supports_aggregation: sophtron.supports_aggregation,
      } as AggregatorIntegration);
    }

    if (institution?.finicity?.id) {
      const finicity = institution.finicity;
      aggregatorList.push({
        isActive: false,
        aggregatorId: finicityAggregator?.id,
        aggregator_institution_id: finicity.id,
        institution_id: institution.id,
        supports_oauth: finicity.supports_oauth,
        supports_identification: finicity.supports_identification,
        supports_verification: finicity.supports_verification,
        supports_history: finicity.supports_history,
        supportsRewards: finicity.supportsRewards,
        supportsBalance: finicity.supportsBalance,
        supports_aggregation: finicity.supports_aggregation,
      } as AggregatorIntegration);
    }
  });

  try {
    await Institution.bulkCreate(institutionsList);
    console.log("Institution successful");

    await AggregatorIntegration.bulkCreate(aggregatorList);
    console.log("aggregator transaction successful");
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
