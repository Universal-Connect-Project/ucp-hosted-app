import { http, HttpResponse } from "msw";
import { m2mAccessTokenResponse } from "./testData/m2mAccessToken";

export const FETCH_ACCESS_TOKEN_URL = `https://example-domain/oauth/token`;

export const handlers = [
  http.post(FETCH_ACCESS_TOKEN_URL, () =>
    HttpResponse.json(m2mAccessTokenResponse),
  ),
];
