import { AggregatorGraphMetricsResponse } from "@repo/shared-utils";
import { api, TagTypes } from "../../baseApi";
import { PERFORMANCE_SERVICE_BASE_URL } from "../../shared/constants/environment";

export const INSTITUTION_SUCCESS_GRAPH_URL = `${PERFORMANCE_SERVICE_BASE_URL}/metrics/institution/:institutionId/successGraph`;
export const INSTITUTION_DURATION_GRAPH_URL = `${PERFORMANCE_SERVICE_BASE_URL}/metrics/institution/:institutionId/durationGraph`;

interface InstitutionGraphParams {
  aggregators: string[];
  institutionId: string;
  jobTypes: string[];
  timeFrame: string;
}

export const institutionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInstitutionDurationGraphData: builder.query<
      AggregatorGraphMetricsResponse,
      InstitutionGraphParams
    >({
      query: ({ aggregators, institutionId, jobTypes, timeFrame }) => ({
        params: { aggregators, jobTypes, timeFrame },
        url: INSTITUTION_DURATION_GRAPH_URL.replace(
          ":institutionId",
          institutionId,
        ),
      }),
      providesTags: [TagTypes.AGGREGATORS, TagTypes.INSTITUTIONS],
    }),
    getInstitutionSuccessGraphData: builder.query<
      AggregatorGraphMetricsResponse,
      InstitutionGraphParams
    >({
      query: ({ aggregators, institutionId, jobTypes, timeFrame }) => ({
        params: { aggregators, jobTypes, timeFrame },
        url: INSTITUTION_SUCCESS_GRAPH_URL.replace(
          ":institutionId",
          institutionId,
        ),
      }),
      providesTags: [TagTypes.AGGREGATORS, TagTypes.INSTITUTIONS],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInstitutionDurationGraphDataQuery,
  useGetInstitutionSuccessGraphDataQuery,
} = institutionApi;
