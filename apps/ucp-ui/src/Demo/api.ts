import { api, TagTypes } from "../baseApi";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";

interface TokenResponse {
  token: string;
}

interface DemoURLResponse {
  url: string;
}

interface TokenParams {
  userId: string;
}

interface WidgetParams {
  token: string;
}

export const TOKEN_URL = `${WIDGET_DEMO_BASE_URL}/api/token`;
export const WIDGET_URL = `${WIDGET_DEMO_BASE_URL}/widget`;

export const demoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDemoToken: builder.query<TokenResponse, TokenParams>({
      query: ({ userId }) => ({
        params: { userId },
        url: TOKEN_URL,
      }),
      providesTags: [TagTypes.DEMO],
    }),
    getDemoURL: builder.query<DemoURLResponse, WidgetParams>({
      query: ({ token }) => ({
        params: { token },
        url: WIDGET_URL,
      }),
      providesTags: [TagTypes.DEMO],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDemoTokenQuery, useGetDemoURLQuery } = demoApi;
