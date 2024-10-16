import { api, TagTypes } from "../../baseApi";
import { HttpMethods } from "../../shared/constants/http";

export interface CreateAggregatorIntegrationParams {
  aggregatorId: number | string;
  aggregatorInstitutionId: string;
  institutionId: string;
  isActive: boolean;
  supportsAggregation: boolean;
  supportsIdentification: boolean;
  supportsFullHistory: boolean;
  supportsOauth: boolean;
  supportsVerification: boolean;
}

const INSTITUTION_SERVICE_BASE_URL = `http://localhost:8088`;

const transformBody = ({
  aggregatorId,
  aggregatorInstitutionId,
  institutionId,
  isActive,
  supportsAggregation,
  supportsIdentification,
  supportsFullHistory,
  supportsOauth,
  supportsVerification,
}: CreateAggregatorIntegrationParams) => ({
  aggregatorId,
  aggregator_institution_id: aggregatorInstitutionId,
  institution_id: institutionId,
  isActive,
  supports_aggregation: supportsAggregation,
  supports_identification: supportsIdentification,
  supports_history: supportsFullHistory,
  supports_oauth: supportsOauth,
  supports_verification: supportsVerification,
});

export const INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL = `${INSTITUTION_SERVICE_BASE_URL}/aggregatorIntegrations`;

export const institutionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAggregatorIntegration: builder.mutation<
      void,
      CreateAggregatorIntegrationParams
    >({
      query: (params) => ({
        body: transformBody(params),
        method: HttpMethods.POST,
        url: INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL,
      }),
      invalidatesTags: (result, error) =>
        !error ? [TagTypes.INSTITUTIONS] : [],
    }),
  }),
  overrideExisting: false,
});

export const { useCreateAggregatorIntegrationMutation } = institutionsApi;
