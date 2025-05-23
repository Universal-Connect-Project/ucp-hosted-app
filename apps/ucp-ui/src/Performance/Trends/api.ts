import { api, TagTypes } from "../../baseApi";
import { PERFORMANCE_SERVICE_BASE_URL } from "../../shared/constants/environment";

export const AGGREGATOR_SUCCESS_GRAPH_URL = `${PERFORMANCE_SERVICE_BASE_URL}/metrics/aggregatorSuccessGraph`;
export const AGGREGATOR_DURATION_GRAPH_URL = `${PERFORMANCE_SERVICE_BASE_URL}/metrics/aggregatorDurationGraph`;

interface AggregatorGraphParams {
  timeFrame: string;
}

interface AggregatorSuccessDataPoint {
  start: string;
  stop: string;
  value: number;
}

export type AggregatorSuccessGraphResponse = Record<
  string,
  AggregatorSuccessDataPoint[]
>;

export const trendsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAggregatorSuccessGraphData: builder.query<
      AggregatorSuccessGraphResponse,
      AggregatorGraphParams
    >({
      query: ({ timeFrame }) => ({
        params: { timeFrame },
        url: AGGREGATOR_SUCCESS_GRAPH_URL,
      }),
      providesTags: [TagTypes.AGGREGATORS],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAggregatorSuccessGraphDataQuery } = trendsApi;
