import { http, HttpResponse } from "msw";
import { exampleUserWithClientId } from "@/test/testData/users";
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
      access_token:
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlZ0SXZBUTZaMGZ2TUxESlJCVXRwViJ9.eyJpc3MiOiJodHRwczovL2Rldi11Y3AudXMuYXV0aDAuY29tLyIsInN1YiI6InpUQm14eGR4ZE9pS1pOclZpUEgxSTVSVEluMzlqQndUQGNsaWVudHMiLCJhdWQiOiJ0ZXN0LXVjcC1hdXRoLWFwaSIsImlhdCI6MTcxNzUzMDg4OSwiZXhwIjoxNzE3NjE3Mjg5LCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJ6VEJteHhkeGRPaUtaTnJWaVBIMUk1UlRJbjM5akJ3VCIsInBlcm1pc3Npb25zIjpbXX0.gxC5BoH77ryoHpz8Eoby94sf6qRsaFtK-IATJsKJ8bCHgXvvROLngUK9k3ojkjl0zI-oAH7QNlKsxUwqtNSmVzoJFuXlrl2976hJFpByICF1eke_tpM5za9qh0KdPVzwciwYF5dF8TQ8QoeUMf3JUJoCcV7NgtNUdIaxqC1OEfGl_y4jyeuVPu_usQ8UvxsrIKjsTLP0ZE4reBTehL5yJs_4atW-d60if1npRn3R7wV6REBox-whiI8zs91zkvSDpCJHhIA7sRv0Rm0W7OeIRG6QucXj1wp8r8Z3bGr_O83AiO6zs_q9HV3pVDMeGzQWUxhs-85D4SEYPPD6pb3JAw",
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
