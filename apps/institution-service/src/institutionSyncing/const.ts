export interface AggregatorInstitution {
  aggregatorInstitutionId: string;
  supportsOAuth: boolean;
  supportsIdentification: boolean;
  supportsVerification: boolean;
  supportsAggregation: boolean;
  supportsHistory: boolean;
  supportsRewards: boolean;
  supportsBalance: boolean;
}
