import { http, HttpResponse } from "msw";
import {
  AUTHENTICATION_SERVICE_CREATE_API_KEYS_URL,
  AUTHENTICATION_SERVICE_GET_API_KEYS_URL,
  AUTHENTICATION_SERVICE_ROTATE_API_KEYS_URL,
} from "../../ApiKeys/api";

export const handlers = [
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
