import { seedInstitutionId } from "./institutions";

export const mxAggregatorId = 98;
export const testExampleBAggregatorId = 99;
export const testExampleAAggregatorId = 100;

export const defaultTestAggregator = {
  institution_id: seedInstitutionId,
  aggregatorId: mxAggregatorId,
  aggregator_institution_id: "defaultBankId",
  isActive: true,
  supports_oauth: false,
  supports_identification: false,
  supports_verification: false,
  supports_aggregation: true,
  supports_history: false,
};
