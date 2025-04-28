import { api, TagTypes } from "../../baseApi";
import { INSTITUTION_SERVICE_BASE_URL } from "../../shared/constants/environment";

interface JobTypePerformance {
  avgSuccessRate: number;
  avgDuration: number;
}

interface JobType {
  [key: string]: JobTypePerformance;
}

interface Aggregator {
  id: number;
  name: string;
  displayName: string;
  logo: string;
  avgSuccessRate: number | null;
  avgDuration: number | null;
  jobTypes: JobType[];
}

export interface AggregatorPerformanceByJobTypeResponse {
  aggregators: Aggregator[];
}

interface AggregatorPerformanceByJobTypeParans {
  timeFrame: string;
}

export const AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_URL = `${INSTITUTION_SERVICE_BASE_URL}/aggregators/performance`;

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
      transformErrorResponse: (response: { status: string | number }) =>
        response.status,
    }),
  }),
  overrideExisting: false,
});

export const { useGetAggregatorPerformanceByJobTypeQuery } =
  aggregatorInsightsApi;
