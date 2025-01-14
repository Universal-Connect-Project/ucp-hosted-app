import { api, TagTypes } from "../../baseApi";
import { INSTITUTION_SERVICE_BASE_URL } from "../../shared/constants/environment";
import { Aggregator } from "../constants/aggregators";

interface AggregatorsResponse {
  aggregators: Aggregator[];
}

export const INSTITUTION_SERVICE_AGGREGATORS_URL = `${INSTITUTION_SERVICE_BASE_URL}/aggregators`;

export const aggregatorsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAggregators: builder.query<AggregatorsResponse, void>({
      query: () => INSTITUTION_SERVICE_AGGREGATORS_URL,
      providesTags: [TagTypes.AGGREGATORS],
      transformErrorResponse: (response: { status: string | number }) =>
        response.status,
    }),
  }),
  overrideExisting: false,
});

export const { useGetAggregatorsQuery } = aggregatorsApi;
