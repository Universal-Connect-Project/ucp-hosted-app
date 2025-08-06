import { api, TagTypes } from "../../baseApi";
import type { Aggregator as BaseAggregator } from "@repo/shared-utils";
import { PERFORMANCE_SERVICE_BASE_URL } from "../../shared/constants/environment";

interface JobTypePerformance {
  avgSuccessRate: number;
  avgDuration: number;
}

export interface Aggregator extends BaseAggregator {
  avgSuccessRate: number | null;
  avgDuration: number | null;
  jobTypes: Record<string, JobTypePerformance>;
}

interface AggregatorPerformanceByJobTypeResponse {
  aggregators: Aggregator[];
}

interface AggregatorPerformanceByJobTypeParans {
  timeFrame: string;
}

export interface InstitutionWithPerformance {
  id: string;
  name: string;
  logo?: string;
  performance: Record<
    string,
    { avgSuccessRate?: number; avgDuration?: number }
  >;
}

interface InstitutionsWithPerformanceResponse {
  aggregators: Aggregator[];
  currentPage: number;
  institutions: InstitutionWithPerformance[];
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface InstitutionsWithPerformanceParams {
  jobTypes: string[];
  page: number;
  pageSize: number;
  search?: string;
  sortBy: string;
  timeFrame: string;
}

export const AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_URL = `${PERFORMANCE_SERVICE_BASE_URL}/metrics/aggregators`;
export const INSTITUTIONS_WITH_PERFORMANCE_URL = `${PERFORMANCE_SERVICE_BASE_URL}/metrics/institutions`;

export const aggregatorInsightsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAggregatorPerformanceByJobType: builder.query<
      AggregatorPerformanceByJobTypeResponse,
      AggregatorPerformanceByJobTypeParans
    >({
      query: ({ timeFrame }) => ({
        params: { timeFrame },
        url: AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_URL,
      }),
      providesTags: [TagTypes.AGGREGATORS],
    }),
    getInstitutionsWithPerformance: builder.query<
      InstitutionsWithPerformanceResponse,
      InstitutionsWithPerformanceParams
    >({
      query: ({ jobTypes, page, pageSize, sortBy, timeFrame, search }) => ({
        params: {
          jobTypes,
          page,
          pageSize,
          sortBy,
          timeFrame,
          search,
        },
        url: INSTITUTIONS_WITH_PERFORMANCE_URL,
      }),
      providesTags: [TagTypes.AGGREGATORS],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAggregatorPerformanceByJobTypeQuery,
  useGetInstitutionsWithPerformanceQuery,
} = aggregatorInsightsApi;
