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
  supportsRewards: boolean;
  supportsBalance: boolean;
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
  supportsRewards: false,
  supportsBalance: false,
};

export const exampleAggregatorPerformanceMetrics = {
  mx: {
    avgSuccessRate: 0.68,
    avgDuration: 10032,
    jobTypes: [
      {
        accountNumber: {
          avgSuccessRate: 0.782608695652174,
          avgDuration: 103521.73913043478,
        },
      },
      {
        transactions: {
          avgSuccessRate: 0.782608695652174,
          avgDuration: 103521.73913043478,
        },
      },
    ],
  },
  sophtron: {
    avgSuccessRate: 0.5105976372480889,
    avgDuration: 108804.03057678943,
    jobTypes: [
      {
        "accountNumber|accountOwner": {
          avgSuccessRate: 0.782608695652174,
          avgDuration: 103521.73913043478,
        },
      },
    ],
  },
  finicity: {
    avgSuccessRate: 0.5105976372480889,
    avgDuration: 108804.03057678943,
    jobTypes: [
      {
        accountNumber: {
          avgSuccessRate: 0.782608695652174,
          avgDuration: 103521.73913043478,
        },
      },
    ],
  },
};
