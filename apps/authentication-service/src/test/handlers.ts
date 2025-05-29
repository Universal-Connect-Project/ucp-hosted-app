import { http, HttpResponse } from "msw";

import envs from "../config";
import {
  exampleAuth0Client,
  exampleClientGrant,
  exampleClientRotatedSecret,
} from "../test/testData/clients";
import {
  exampleApiToken,
  exampleUserWithClientId,
} from "../test/testData/users";

const domain: string = envs.AUTH0_DOMAIN;
const tokenDomain: string = envs.AUTH0_TOKEN_DOMAIN;
const AUTH0_BASE_URL = `https://${domain}/`;
const AUTH0_TOKEN_BASE_URL = `https://${tokenDomain}/`;

export const AUTH0_USER_BY_ID = `${AUTH0_BASE_URL}api/v2/users/:id`;
export const AUTH0_AUTH_TOKEN = `${AUTH0_TOKEN_BASE_URL}oauth/token`;
export const AUTH0_CLIENTS = `${AUTH0_BASE_URL}api/v2/clients`;
export const AUTH0_CLIENTS_BY_ID = `${AUTH0_BASE_URL}api/v2/clients/:id`;
export const AUTH0_CLIENT_GRANTS = `${AUTH0_BASE_URL}api/v2/client-grants`;

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
  http.get(AUTH0_CLIENTS_BY_ID, () => HttpResponse.json(exampleAuth0Client)),
  http.post(AUTH0_CLIENTS, () => HttpResponse.json(exampleAuth0Client)),
  http.delete(AUTH0_CLIENTS_BY_ID, () => HttpResponse.json(null)),
  http.post(`${AUTH0_CLIENTS_BY_ID}/rotate-secret`, () =>
    HttpResponse.json(exampleClientRotatedSecret),
  ),
  http.post(AUTH0_CLIENT_GRANTS, () => HttpResponse.json(exampleClientGrant)),
];
