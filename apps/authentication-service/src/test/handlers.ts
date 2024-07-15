import { exampleClient } from "@/test/testData/clients";
import { http, HttpResponse } from "msw";
import {
  exampleUserWithClientId,
  exampleApiToken,
} from "@/test/testData/users";
import envs from "@/config";

const domain: string = envs.AUTH0_DOMAIN;
const AUTH0_BASE_URL = `https://${domain}/`;

export const AUTH0_USER_BY_ID = `${AUTH0_BASE_URL}api/v2/users/:id`;
export const AUTH0_AUTH_TOKEN = `${AUTH0_BASE_URL}oauth/token`;
export const AUTH0_CLIENTS = `${AUTH0_BASE_URL}api/v2/clients`;
export const AUTH0_CLIENTS_BY_ID = `${AUTH0_BASE_URL}api/v2/clients/:id`;

export const handlers = [
  http.get(AUTH0_USER_BY_ID, () => HttpResponse.json(exampleUserWithClientId)),
  http.patch(AUTH0_USER_BY_ID, () =>
    HttpResponse.json(exampleUserWithClientId),
  ),
  http.post(AUTH0_AUTH_TOKEN, () =>
    HttpResponse.json({
      access_token: exampleApiToken,
    }),
  ),
  http.get(AUTH0_CLIENTS_BY_ID, () => HttpResponse.json(exampleClient)),
  http.post(AUTH0_CLIENTS, () => HttpResponse.json(exampleClient)),
  http.delete(AUTH0_CLIENTS_BY_ID, () => HttpResponse.json(null)),
];
