import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_URL } from "../environment";
import { tokenResponse } from "./testData/auth0";
import { testAggregators } from "./testData/aggregators";

const AUTH0_BASE_URL = `https://${process.env.AUTH0_DOMAIN}/`;

export const AUTH0_AUTH_TOKEN_URL = `${AUTH0_BASE_URL}oauth/token`;
export const INSTITUTION_SERVICE_AGGREGATORS_URL = `${INSTITUTION_SERVICE_URL}/performanceAuth/aggregators`;

export const handlers = [
  http.get(INSTITUTION_SERVICE_AGGREGATORS_URL, () =>
    HttpResponse.json({ aggregators: testAggregators }),
  ),
  http.post(AUTH0_AUTH_TOKEN_URL, () => HttpResponse.json(tokenResponse)),
];
