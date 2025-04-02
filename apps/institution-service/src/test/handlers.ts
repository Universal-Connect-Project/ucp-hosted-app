import { http, HttpResponse } from "msw";
import { exampleApiToken } from "./testData/auth0";
import { exampleAggregatorPerformanceMetrics } from "./testData/aggregators";

const AUTH0_BASE_URL = `https://${process.env.AUTH0_DOMAIN}/`;

const AUTH0_AUTH_TOKEN = `${AUTH0_BASE_URL}oauth/token`;
export const AGGREGATOR_PERFORMANCE_URL = `${process.env.PERFORMANCE_SERVICE_URL}/metrics/aggregators`;

export const handlers = [
  http.post(AUTH0_AUTH_TOKEN, () =>
    HttpResponse.json({
      access_token: exampleApiToken,
    }),
  ),
  http.get(AGGREGATOR_PERFORMANCE_URL, () =>
    HttpResponse.json(exampleAggregatorPerformanceMetrics),
  ),
];
