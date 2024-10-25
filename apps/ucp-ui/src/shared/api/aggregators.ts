import { api, TagTypes } from "../../baseApi";
import { Aggregator } from "../constants/aggregators";

interface AggregatorsResponse {
  aggregators: Aggregator[];
}

const INSTITUTION_SERVICE_BASE_URL = `http://localhost:8088`;

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
