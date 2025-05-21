import { api, TagTypes } from "../../baseApi";
import { PERFORMANCE_SERVICE_BASE_URL } from "../../shared/constants/environment";

export const AGGREGATOR_SUCCESS_GRAPH_URL = `${PERFORMANCE_SERVICE_BASE_URL}/metrics/aggregatorSuccessGraph`;

interface AggregatorGraphParams {
  timeFrame: string;
}

export const trendsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAggregatorSuccessGraphData: builder.query<void, AggregatorGraphParams>({
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
