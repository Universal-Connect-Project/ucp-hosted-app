import { http, HttpResponse } from "msw";
import { exampleUserWithClientId, exampleToken } from "@/test/testData/users";
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
      access_token: exampleToken,
    }),
  ),
  http.get(AUTH0_CLIENTS_BY_ID, () =>
    HttpResponse.json({
      tenant: "dev-ucp",
      name: "Unit Test Client",
      description: "For unit testing",
      client_id: "ucp-test-client",
      client_aliases: [],
      token_endpoint_auth_method: "client_secret_post",
      app_type: "non_interactive",
      grant_types: [
        "client_credentials",
        "password",
        "http://auth0.com/oauth/grant-type/password-realm",
      ],
    }),
  ),
  http.post(AUTH0_CLIENTS, () =>
    HttpResponse.json({
      client_id: "ucp-test-client",
      name: "Unit Test Client",
      description: "For unit testing",
      app_type: "non_interactive",
    }),
  ),
  http.delete(AUTH0_CLIENTS_BY_ID, () =>
    HttpResponse.json({
      client_id: "ucp-test-client",
      name: "Unit Test Client",
      description: "For unit testing",
      app_type: "non_interactive",
    }),
  ),
];
