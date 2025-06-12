import { api, TagTypes } from "../../baseApi";
import type { Aggregator as BaseAggregator } from "@repo/shared-utils";
import { INSTITUTION_SERVICE_BASE_URL } from "../../shared/constants/environment";

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
    }),
  }),
  overrideExisting: false,
});

export const { useGetAggregatorPerformanceByJobTypeQuery } =
  aggregatorInsightsApi;
