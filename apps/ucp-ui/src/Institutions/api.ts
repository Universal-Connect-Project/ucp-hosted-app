import { api, TagTypes } from "../baseApi";
import { saveAs } from "../shared/utils/fileSaver";
import { Aggregator } from "../shared/constants/aggregators";
import { INSTITUTION_SERVICE_BASE_URL } from "../shared/constants/environment";

interface InstitutionPermissions {
  canCreateInstitution: boolean;
}

export interface AggregatorIntegration {
  aggregator_institution_id: string;
  aggregator: Aggregator;
  id: number;
  isActive: boolean;
  supports_aggregation: boolean;
  supports_history: boolean;
  supports_identification: boolean;
  supports_oauth: boolean;
  supports_verification: boolean;
  supportsRewards: boolean;
  supportsBalance: boolean;
}

export interface Institution {
  aggregatorIntegrations: AggregatorIntegration[];
  id: string;
  is_test_bank: boolean;
  keywords: string[];
  logo: string;
  name: string;
  routing_numbers: string[];
  url: string;
}

interface InstitutionsResponse {
  currentPage: number;
  institutions: Institution[];
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

interface AggregatorIntegrationPermissions {
  canDelete: boolean;
  canEdit: boolean;
}

export interface InstitutionDetailPermissions {
  aggregatorIntegrationPermissionsMap: Record<
    string,
    AggregatorIntegrationPermissions
  >;
  aggregatorsThatCanBeAdded: Aggregator[];
  canDeleteInstitution: boolean;
  canEditInstitution: boolean;
  hasAccessToAllAggregators: boolean;
}

interface InstitutionResponse {
  institution: Institution;
  permissions: InstitutionDetailPermissions;
}

export interface InstitutionParamsBooleans {
  includeInactiveIntegrations?: boolean;
  supportsAggregation?: boolean;
  supportsHistory?: boolean;
  supportsIdentification?: boolean;
  supportsOauth?: boolean;
  supportsVerification?: boolean;
  supportsRewards?: boolean;
  supportsBalance?: boolean;
}

export interface InstitutionsParams extends InstitutionParamsBooleans {
  pageSize: number;
  page: number;
  aggregatorName: string[];
  search?: string;
}

interface GetInstitution {
  id: string;
}

export const INSTITUTION_SERVICE_PERMISSIONS_URL = `${INSTITUTION_SERVICE_BASE_URL}/permissions`;
export const INSTITUTION_SERVICE_INSTITUTIONS_URL = `${INSTITUTION_SERVICE_BASE_URL}/institutions`;
export const INSTITUTION_SERVICE_INSTITUTIONS_DOWNLOAD_URL = `${INSTITUTION_SERVICE_BASE_URL}/institutions/cacheList/download`;

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
    getInstitutions: builder.query<InstitutionsResponse, InstitutionsParams>({
      query: ({ aggregatorName, ...rest }) => {
        const customParams = new URLSearchParams();

        Object.entries(rest).forEach(([key, value]) =>
          customParams.append(key, value as string),
        );

        aggregatorName?.forEach((name: string) =>
          customParams.append("aggregatorName", name),
        );

        return {
          url: `${INSTITUTION_SERVICE_INSTITUTIONS_URL}?${customParams.toString()}`,
        };
      },
      providesTags: [TagTypes.INSTITUTIONS],
    }),
    getInstitutionsJson: builder.query<void, void>({
      query: () => {
        return {
          url: INSTITUTION_SERVICE_INSTITUTIONS_DOWNLOAD_URL,
          responseHandler: async (response) => {
            if (response.ok) {
              const blob = await response.blob();

              saveAs(blob, "UCPInstitutions.json");
            }
          },
        };
      },
      transformResponse: () => {
        // We don't want to cache the data
        return undefined;
      },
      keepUnusedDataFor: 0,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInstitutionQuery,
  useGetInstitutionPermissionsQuery,
  useGetInstitutionsQuery,
  useLazyGetInstitutionsJsonQuery,
} = institutionsApi;
