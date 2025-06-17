import { AggregatorGraphMetricsResponse } from "@repo/shared-utils";
import { api, TagTypes } from "../../baseApi";
import { INSTITUTION_SERVICE_BASE_URL } from "../../shared/constants/environment";

export const AGGREGATOR_SUCCESS_GRAPH_URL = `${INSTITUTION_SERVICE_BASE_URL}/aggregators/successGraph`;
export const AGGREGATOR_DURATION_GRAPH_URL = `${INSTITUTION_SERVICE_BASE_URL}/aggregators/durationGraph`;

interface AggregatorGraphParams {
  aggregators: string[];
  timeFrame: string;
}

export const trendsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAggregatorDurationGraphData: builder.query<
      AggregatorGraphMetricsResponse,
      AggregatorGraphParams
    >({
      query: ({ aggregators, timeFrame }) => ({
        params: { aggregators, timeFrame },
        url: AGGREGATOR_DURATION_GRAPH_URL,
      }),
      providesTags: [TagTypes.AGGREGATORS],
    }),
    getAggregatorSuccessGraphData: builder.query<
      AggregatorGraphMetricsResponse,
      AggregatorGraphParams
    >({
      query: ({ aggregators, timeFrame }) => ({
        params: { aggregators, timeFrame },
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
