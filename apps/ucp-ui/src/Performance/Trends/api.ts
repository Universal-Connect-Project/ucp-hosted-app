import { AggregatorGraphMetricsResponse } from "@repo/shared-utils";
import { api, TagTypes } from "../../baseApi";
import { PERFORMANCE_SERVICE_BASE_URL } from "../../shared/constants/environment";

export const AGGREGATOR_SUCCESS_GRAPH_URL = `${PERFORMANCE_SERVICE_BASE_URL}/metrics/aggregatorSuccessGraph`;
export const AGGREGATOR_DURATION_GRAPH_URL = `${PERFORMANCE_SERVICE_BASE_URL}/metrics/aggregatorDurationGraph`;

interface AggregatorGraphParams {
  aggregators: string[];
  jobTypes: string[];
  timeFrame: string;
}

export const trendsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAggregatorDurationGraphData: builder.query<
      AggregatorGraphMetricsResponse,
      AggregatorGraphParams
    >({
      query: ({ aggregators, jobTypes, timeFrame }) => ({
        params: { aggregators, jobTypes, timeFrame },
        url: AGGREGATOR_DURATION_GRAPH_URL,
      }),
      providesTags: [TagTypes.AGGREGATORS],
    }),
    getAggregatorSuccessGraphData: builder.query<
      AggregatorGraphMetricsResponse,
      AggregatorGraphParams
    >({
      query: ({ aggregators, jobTypes, timeFrame }) => ({
        params: { aggregators, jobTypes, timeFrame },
        url: AGGREGATOR_SUCCESS_GRAPH_URL,
      }),
      providesTags: [TagTypes.AGGREGATORS],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAggregatorDurationGraphDataQuery,
  useGetAggregatorSuccessGraphDataQuery,
} = trendsApi;
