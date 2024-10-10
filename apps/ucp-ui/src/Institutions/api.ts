import { api, TagTypes } from "../baseApi";

interface InstitutionPermissions {
  canCreateInstitution: boolean;
}

interface Aggregator {
  displayName: string;
  id: number;
  logo: string;
  name: string;
}

export interface AggregatorIntegration {
  aggregator_institution_id: string;
  aggregator: Aggregator;
  id: string;
  isActive: boolean;
  supports_aggregation: boolean;
  supports_history: boolean;
  supports_identification: boolean;
  supports_oauth: boolean;
  supports_verification: boolean;
}

interface Institution {
  aggregatorIntegrations: AggregatorIntegration[];
  id: string;
  is_test_bank: boolean;
  keywords: string[];
  logo: string;
  name: string;
  routing_numbers: string[];
  url: string;
}

export interface InstitutionWithPermissions extends Institution {
  canEditInstitution: boolean;
  canCreateAggregatorIntegration: boolean;
}

interface InstitutionsResponse {
  currentPage: number;
  institutions: Institution[];
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

interface InstitutionResponse {
  institution: InstitutionWithPermissions;
}

interface PaginationOptions {
  pageSize: number;
  page: number;
}

interface GetInstitution {
  id: string;
}

const INSTITUTION_SERVICE_BASE_URL = `http://localhost:8088`;

export const INSTITUTION_SERVICE_PERMISSIONS_URL = `${INSTITUTION_SERVICE_BASE_URL}/permissions`;
export const INSTITUTION_SERVICE_INSTITUTIONS_URL = `${INSTITUTION_SERVICE_BASE_URL}/institutions`;

export const institutionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInstitution: builder.query<InstitutionResponse, GetInstitution>({
      query: ({ id }) => ({
        url: `${INSTITUTION_SERVICE_INSTITUTIONS_URL}/${id}`,
      }),
      providesTags: [TagTypes.INSTITUTIONS],
    }),
    getInstitutionPermissions: builder.query<InstitutionPermissions, void>({
      query: () => INSTITUTION_SERVICE_PERMISSIONS_URL,
      providesTags: [TagTypes.INSTITUTION_PERMISSIONS],
    }),
    getInstitutions: builder.query<InstitutionsResponse, PaginationOptions>({
      query: (params) => ({
        params,
        url: INSTITUTION_SERVICE_INSTITUTIONS_URL,
      }),
      providesTags: [TagTypes.INSTITUTIONS],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInstitutionQuery,
  useGetInstitutionPermissionsQuery,
  useGetInstitutionsQuery,
} = institutionsApi;
