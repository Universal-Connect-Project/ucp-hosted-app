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
  INSTITUTION_SERVICE_INSTITUTIONS_URL,
  INSTITUTION_SERVICE_PERMISSIONS_URL,
} from "../../Institutions/api";
import { institutionsPage1 } from "../../Institutions/testData/institutions";

export const handlers = [
  http.post(INSTITUTION_SERVICE_CREATE_INSTITUTION_URL, () =>
    HttpResponse.json(createInstitutionResponse),
  ),
  http.get(INSTITUTION_SERVICE_PERMISSIONS_URL, () =>
    HttpResponse.json(institutionPermissionsResponse),
  ),
  http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, () =>
    HttpResponse.json(institutionsPage1),
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
];
