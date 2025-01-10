import { http, HttpResponse } from "msw";
import {
  AUTHENTICATION_SERVICE_CREATE_API_KEYS_URL,
  AUTHENTICATION_SERVICE_GET_API_KEYS_URL,
  AUTHENTICATION_SERVICE_ROTATE_API_KEYS_URL,
} from "../../ApiKeys/api";
import { INSTITUTION_SERVICE_CREATE_INSTITUTION_URL } from "../../Institutions/ChangeInstitution/api";
import {
  createInstitutionResponse,
  institutionPermissionsResponse,
} from "./testData/institution";
import {
  INSTITUTION_SERVICE_INSTITUTIONS_DOWNLOAD_URL,
  INSTITUTION_SERVICE_INSTITUTIONS_URL,
  INSTITUTION_SERVICE_PERMISSIONS_URL,
} from "../../Institutions/api";
import {
  institutionResponse,
  institutionsPage1,
} from "../../Institutions/testData/institutions";
import { INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL } from "../../Institutions/ChangeAggregatorIntegration/api";
import { INSTITUTION_SERVICE_AGGREGATORS_URL } from "../api/aggregators";
import { aggregatorsResponse } from "../api/testData/aggregators";

export const handlers = [
  http.post(INSTITUTION_SERVICE_CREATE_INSTITUTION_URL, () =>
    HttpResponse.json(createInstitutionResponse),
  ),
  http.post(INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL, () =>
    HttpResponse.json({}),
  ),
  http.put(
    `${INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL}/:integrationId`,
    () => HttpResponse.json({}),
  ),
  http.delete(
    `${INSTITUTION_SERVICE_CREATE_AGGREGATOR_INTEGRATION_URL}/:integrationId`,
    () => HttpResponse.json({}),
  ),
  http.get(INSTITUTION_SERVICE_PERMISSIONS_URL, () =>
    HttpResponse.json(institutionPermissionsResponse),
  ),
  http.get(INSTITUTION_SERVICE_INSTITUTIONS_DOWNLOAD_URL, () =>
    HttpResponse.json({}),
  ),
  http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, () =>
    HttpResponse.json(institutionsPage1),
  ),
  http.get(`${INSTITUTION_SERVICE_INSTITUTIONS_URL}/:institutionId`, () =>
    HttpResponse.json(institutionResponse),
  ),
  http.delete(`${INSTITUTION_SERVICE_INSTITUTIONS_URL}/:institutionId`, () =>
    HttpResponse.json({}),
  ),
  http.post(
    AUTHENTICATION_SERVICE_CREATE_API_KEYS_URL,
    () => new HttpResponse(null, { status: 201 }),
  ),
  http.post(
    AUTHENTICATION_SERVICE_ROTATE_API_KEYS_URL,
    () => new HttpResponse(null, { status: 200 }),
  ),
  http.get(
    AUTHENTICATION_SERVICE_GET_API_KEYS_URL,
    () => new HttpResponse(null, { status: 404 }),
  ),
  http.get(INSTITUTION_SERVICE_AGGREGATORS_URL, () =>
    HttpResponse.json(aggregatorsResponse),
  ),
];
