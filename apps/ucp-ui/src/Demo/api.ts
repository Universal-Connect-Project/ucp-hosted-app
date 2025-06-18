import { api, TagTypes } from "../baseApi";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";

interface TokenResponse {
  token: string;
}

interface DemoURLResponse {
  html: HTMLBaseElement;
}

interface TokenParams {
  userId: string;
}

interface WidgetParams {
  token: string;
  jobTypes: string;
  userId: string;
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
      keepUnusedDataFor: 0,
    }),
    getDemoURL: builder.query<DemoURLResponse, WidgetParams>({
      query: ({ token, jobTypes, userId }) => ({
        params: { token },
        url: `${WIDGET_URL}?jobTypes=${jobTypes}&userId=${userId}`,
        responseHandler: (response) =>
          response.text().then((text) => ({ html: text })),
      }),
      providesTags: [TagTypes.DEMO],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDemoTokenQuery, useGetDemoURLQuery } = demoApi;
