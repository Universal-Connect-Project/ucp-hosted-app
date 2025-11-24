import { api } from "../baseApi";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";

interface CreateWidgetUrlParams {
  jobTypes?: string[];
  userId?: string;
  targetOrigin?: string;
  institutionId?: string;
  connectionId?: string;
  aggregator?: string;
  singleAccountSelect?: boolean;
  aggregatorOverride?: string;
}

interface CreateWidgetUrlResponse {
  widgetUrl: string;
}

export const TOKEN_URL = `${WIDGET_DEMO_BASE_URL}/api/token`;

export const demoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createWidgetUrl: builder.query<
      CreateWidgetUrlResponse,
      CreateWidgetUrlParams
    >({
      query: (body) => ({
        url: `${WIDGET_DEMO_BASE_URL}/widgetUrl`,
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useCreateWidgetUrlQuery } = demoApi;
