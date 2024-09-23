import { http, HttpResponse } from "msw";
import {
  AUTHENTICATION_SERVICE_CREATE_API_KEYS_URL,
  AUTHENTICATION_SERVICE_GET_API_KEYS_URL,
  AUTHENTICATION_SERVICE_ROTATE_API_KEYS_URL,
} from "../../ApiKeys/api";
import { INSTITUTION_SERVICE_CREATE_INSTITUTION_URL } from "../../Institutions/ChangeInstitution/api";
import { createInstitutionResponse } from "./testData/institution";

export const handlers = [
  http.post(INSTITUTION_SERVICE_CREATE_INSTITUTION_URL, () =>
    HttpResponse.json(createInstitutionResponse),
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
