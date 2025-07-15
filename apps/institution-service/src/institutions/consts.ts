export interface AggregatorIntegrationResponse {
  aggregator_institution_id: string;
  id: number;
  supports_oauth: boolean;
  supports_identification: boolean;
  supports_verification: boolean;
  supports_aggregation: boolean;
  supports_history: boolean;
  supportsRewards: boolean;
  supportsBalance: boolean;
  isActive: boolean;
  aggregator: {
    name: string;
    id: number;
    displayName: string | null;
    logo: string | null;
  };
}

export interface InstitutionDetail {
  id: string;
  name: string;
  keywords: string[];
  logo: string;
  url: string;
  is_test_bank: boolean;
  routing_numbers: string[];
  createdAt: string;
  updatedAt: string;
  aggregatorIntegrations: AggregatorIntegrationResponse[];
}

export interface PaginatedInstitutionsResponse {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  institutions: InstitutionDetail[];
}
