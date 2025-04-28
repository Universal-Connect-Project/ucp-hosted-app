import { api, TagTypes } from "../../baseApi";
import { INSTITUTION_SERVICE_BASE_URL } from "../../shared/constants/environment";

interface AggregatorPerformanceByJobTypeResponse {}

export const AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_URL = `${INSTITUTION_SERVICE_BASE_URL}/aggregators/performance`;

export const aggregatorInsightsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAggregatorPerformanceByJobType: builder.query<
      AggregatorPerformanceByJobTypeResponse,
      void
    >({
      query: () => AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_URL,
      providesTags: [TagTypes.AGGREGATORS],
      transformErrorResponse: (response: { status: string | number }) =>
        response.status,
    }),
  }),
  overrideExisting: false,
});

export const { useGetAggregatorPerformanceByJobTypeQuery } =
  aggregatorInsightsApi;
