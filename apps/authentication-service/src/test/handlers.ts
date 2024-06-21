import { exampleUser } from "@/test/testData/users";
import { http, HttpResponse } from "msw";
import envs from "@/config";
import { authEndpoint } from "@/shared/auth/authService";

const domain: string = envs.AUTH0_DOMAIN;

export const handlers = [
  http.get(`https://${domain}/api/v2/users/:id`, () =>
    HttpResponse.json(exampleUser),
  ),
  http.patch(`https://${domain}/api/v2/users/:id`, () =>
    HttpResponse.json(exampleUser),
  ),
  http.post(`https://${domain}/${authEndpoint}`, () =>
    HttpResponse.json({
      access_token:
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlZ0SXZBUTZaMGZ2TUxESlJCVXRwViJ9.eyJpc3MiOiJodHRwczovL2Rldi11Y3AudXMuYXV0aDAuY29tLyIsInN1YiI6InpUQm14eGR4ZE9pS1pOclZpUEgxSTVSVEluMzlqQndUQGNsaWVudHMiLCJhdWQiOiJ0ZXN0LXVjcC1hdXRoLWFwaSIsImlhdCI6MTcxNzUzMDg4OSwiZXhwIjoxNzE3NjE3Mjg5LCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJ6VEJteHhkeGRPaUtaTnJWaVBIMUk1UlRJbjM5akJ3VCIsInBlcm1pc3Npb25zIjpbXX0.gxC5BoH77ryoHpz8Eoby94sf6qRsaFtK-IATJsKJ8bCHgXvvROLngUK9k3ojkjl0zI-oAH7QNlKsxUwqtNSmVzoJFuXlrl2976hJFpByICF1eke_tpM5za9qh0KdPVzwciwYF5dF8TQ8QoeUMf3JUJoCcV7NgtNUdIaxqC1OEfGl_y4jyeuVPu_usQ8UvxsrIKjsTLP0ZE4reBTehL5yJs_4atW-d60if1npRn3R7wV6REBox-whiI8zs91zkvSDpCJHhIA7sRv0Rm0W7OeIRG6QucXj1wp8r8Z3bGr_O83AiO6zs_q9HV3pVDMeGzQWUxhs-85D4SEYPPD6pb3JAw",
    }),
  ),
  http.get(`https://${domain}/api/v2/clients/:id`, () =>
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
  http.post(`https://${domain}/api/v2/clients`, () =>
    HttpResponse.json({
      client_id: "ucp-test-client",
      name: "Unit Test Client",
      description: "For unit testing",
      app_type: "non_interactive",
    }),
  ),
  http.delete(`https://${domain}/api/v2/clients/:id`, () =>
    HttpResponse.json({
      client_id: "ucp-test-client",
      name: "Unit Test Client",
      description: "For unit testing",
      app_type: "non_interactive",
    }),
  ),
];
