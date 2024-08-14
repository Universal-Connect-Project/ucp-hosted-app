import { api, TagTypes } from "../baseApi";
import { HttpMethods } from "../shared/constants/http";

interface ApiKeys {}

const AUTHENTICATION_SERVICE_BASE_URL = `http://localhost:8089`;

export const apiKeysApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createApiKeys: builder.mutation<ApiKeys, void>({
      query: () => ({
        method: HttpMethods.POST,
        url: `${AUTHENTICATION_SERVICE_BASE_URL}/v1/clients/keys`,
      }),
      invalidatesTags: [TagTypes.API_KEYS],
    }),
    getApiKeys: builder.query<ApiKeys, void>({
      query: () => `${AUTHENTICATION_SERVICE_BASE_URL}/v1/clients/keys`,
      providesTags: [TagTypes.API_KEYS],
      transformErrorResponse: (response: { status: string | number }) =>
        response.status,
    }),
  }),
  overrideExisting: false,
});

export const { useCreateApiKeysMutation, useGetApiKeysQuery } = apiKeysApi;
