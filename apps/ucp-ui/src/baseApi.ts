import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "./shared/reducers/token";
import { RootState } from "./store";

export enum TagTypes {
  AGGREGATORS = "aggregators",
  API_KEYS = "apiKeys",
  INSTITUTIONS = "institutions",
  INSTITUTION_PERMISSIONS = "institutionPermissions",
  DEMO = "demo",
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    prepareHeaders: (headers, { getState }) => {
      const token = getAccessToken(getState() as RootState);

      headers.set("Authorization", `Bearer ${token}`);

      return headers;
    },
  }),
  endpoints: () => ({}),
  reducerPath: "api",
  tagTypes: Object.values(TagTypes),
});
