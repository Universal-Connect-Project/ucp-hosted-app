import { http, HttpResponse } from "msw";
import { tokenResponse } from "./testData/auth0";
import {
  aggregatorDurationGraphData,
  aggregatorSuccessGraphData,
  exampleAggregatorPerformanceMetrics,
} from "./testData/aggregators";
import { PERFORMANCE_SERVICE_URL } from "../shared/environment";

const AUTH0_BASE_URL = `https://${process.env.AUTH0_DOMAIN}/`;

export const AUTH0_AUTH_TOKEN_URL = `${AUTH0_BASE_URL}oauth/token`;
export const AGGREGATOR_PERFORMANCE_URL = `${PERFORMANCE_SERVICE_URL}/metrics/aggregators`;
const AGGREGATOR_SUCCESS_GRAPH_URL = `${PERFORMANCE_SERVICE_URL}/metrics/aggregatorSuccessGraph`;
const AGGREGATOR_DURATION_GRAPH_URL = `${PERFORMANCE_SERVICE_URL}/metrics/aggregatorDurationGraph`;

export const handlers = [
  http.post(AUTH0_AUTH_TOKEN_URL, () => HttpResponse.json(tokenResponse)),
  http.get(AGGREGATOR_PERFORMANCE_URL, () =>
    HttpResponse.json(exampleAggregatorPerformanceMetrics),
  ),
  http.get(AGGREGATOR_SUCCESS_GRAPH_URL, () =>
    HttpResponse.json(aggregatorSuccessGraphData),
  ),
  http.get(AGGREGATOR_DURATION_GRAPH_URL, () =>
    HttpResponse.json(aggregatorDurationGraphData),
  ),
];
