import { api, TagTypes } from "../baseApi";
import { AUTHENTICATION_SERVICE_BASE_URL } from "../shared/constants/environment";
import { HttpMethods } from "../shared/constants/http";

interface ApiKeys {
  clientId: string;
  clientSecret: string;
}

export const AUTHENTICATION_SERVICE_CREATE_API_KEYS_URL = `${AUTHENTICATION_SERVICE_BASE_URL}/v1/clients/keys`;
export const AUTHENTICATION_SERVICE_GET_API_KEYS_URL = `${AUTHENTICATION_SERVICE_BASE_URL}/v1/clients/keys`;
export const AUTHENTICATION_SERVICE_ROTATE_API_KEYS_URL = `${AUTHENTICATION_SERVICE_BASE_URL}/v1/clients/keys/rotate`;

export const apiKeysApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createApiKeys: builder.mutation<ApiKeys, void>({
      query: () => ({
        method: HttpMethods.POST,
        url: AUTHENTICATION_SERVICE_CREATE_API_KEYS_URL,
      }),
      invalidatesTags: (result, error) => (!error ? [TagTypes.API_KEYS] : []),
    }),
    getApiKeys: builder.query<ApiKeys, void>({
      query: () => AUTHENTICATION_SERVICE_GET_API_KEYS_URL,
      providesTags: [TagTypes.API_KEYS],
      transformErrorResponse: (response: { status: string | number }) =>
        response.status,
    }),
    rotateApiKeys: builder.mutation<ApiKeys, void>({
      query: () => ({
        method: HttpMethods.POST,
        url: AUTHENTICATION_SERVICE_ROTATE_API_KEYS_URL,
      }),
      invalidatesTags: (result, error) => (!error ? [TagTypes.API_KEYS] : []),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateApiKeysMutation,
  useGetApiKeysQuery,
  useRotateApiKeysMutation,
} = apiKeysApi;
