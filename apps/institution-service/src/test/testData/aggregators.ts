import { UUID } from "crypto";
import { seedInstitutionId } from "./institutions";

export const mxAggregatorId = 98;
export const testExampleBAggregatorId = 99;
export const testExampleAAggregatorId = 100;

interface AggregatorIntegrationBody {
  institution_id: UUID;
  aggregatorId: number;
  aggregator_institution_id: string;
  isActive: boolean;
  supports_oauth: boolean;
  supports_identification: boolean;
  supports_verification: boolean;
  supports_aggregation: boolean;
  supports_history: boolean;
}

export const defaultTestAggregator: AggregatorIntegrationBody = {
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
