import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "./shared/reducers/token";
import { RootState } from "./store";

export enum TagTypes {
  API_KEYS = "apiKeys",
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
  tagTypes: Object.keys(TagTypes),
});
