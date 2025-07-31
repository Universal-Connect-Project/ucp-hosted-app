import { api } from "../baseApi";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";

interface TokenResponse {
  token: string;
}

interface TokenParams {
  userId: string;
}

export const TOKEN_URL = `${WIDGET_DEMO_BASE_URL}/api/token`;

export const demoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDemoToken: builder.query<TokenResponse, TokenParams>({
      query: ({ userId }) => ({
        params: { userId },
        url: TOKEN_URL,
      }),
      keepUnusedDataFor: 0,
    }),
  }),
  overrideExisting: false,
});

export const { useGetDemoTokenQuery } = demoApi;
