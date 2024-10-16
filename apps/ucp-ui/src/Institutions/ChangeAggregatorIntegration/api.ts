import { api, TagTypes } from "../../baseApi";
import { HttpMethods } from "../../shared/constants/http";

interface ChangeAggregatorIntegrationParams {
  aggregatorInstitutionId: string;
  isActive: boolean;
  supportsAggregation: boolean;
  supportsIdentification: boolean;
  supportsFullHistory: boolean;
  supportsOauth: boolean;
  supportsVerification: boolean;
}

export interface CreateAggregatorIntegrationParams
  extends ChangeAggregatorIntegrationParams {
  aggregatorId: number | string;
  institutionId: string;
}

interface EditAggregatorIntegrationParams
  extends ChangeAggregatorIntegrationParams {
  aggregatorIntegrationId: number;
}

const INSTITUTION_SERVICE_BASE_URL = `http://localhost:8088`;

const transformBody = ({
  aggregatorInstitutionId,
  isActive,
  supportsAggregation,
  supportsIdentification,
  supportsFullHistory,
  supportsOauth,
  supportsVerification,
}: ChangeAggregatorIntegrationParams) => ({
  aggregator_institution_id: aggregatorInstitutionId,
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
      query: ({ aggregatorId, institutionId, ...rest }) => ({
        body: {
          ...transformBody(rest),
          aggregatorId,
          institution_id: institutionId,
        },
        method: HttpMethods.POST,
        url: INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL,
      }),
      invalidatesTags: (result, error) =>
        !error ? [TagTypes.INSTITUTIONS] : [],
    }),
    EditAggregatorIntegration: builder.mutation<
      void,
      EditAggregatorIntegrationParams
    >({
      query: ({ aggregatorIntegrationId, ...rest }) => ({
        body: transformBody(rest),
        method: HttpMethods.PUT,
        url: `${INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL}/${aggregatorIntegrationId}`,
      }),
      invalidatesTags: (result, error) =>
        !error ? [TagTypes.INSTITUTIONS] : [],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateAggregatorIntegrationMutation,
  useEditAggregatorIntegrationMutation,
} = institutionsApi;
