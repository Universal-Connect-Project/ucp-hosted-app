import { ResponseError, UserInfoResponse } from "auth0";
import { User } from "@/shared/users/usersModel";

export const exampleUserID = "google-oauth2|0000000000000000000000000000000";
export const exampleClientID: string = "test-client-id";

export const exampleToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlZ0SXZBUTZaMGZ2TUxESlJCVXRwViJ9.eyJpc3MiOiJodHRwczovL2Rldi11Y3AudXMuYXV0aDAuY29tLyIsInN1YiI6InpUQm14eGR4ZE9pS1pOclZpUEgxSTVSVEluMzlqQndUQGNsaWVudHMiLCJhdWQiOiJ0ZXN0LXVjcC1hdXRoLWFwaSIsImlhdCI6MTcxNzUzMDg4OSwiZXhwIjoxNzE3NjE3Mjg5LCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJ6VEJteHhkeGRPaUtaTnJWaVBIMUk1UlRJbjM5akJ3VCIsInBlcm1pc3Npb25zIjpbXX0.gxC5BoH77ryoHpz8Eoby94sf6qRsaFtK-IATJsKJ8bCHgXvvROLngUK9k3ojkjl0zI-oAH7QNlKsxUwqtNSmVzoJFuXlrl2976hJFpByICF1eke_tpM5za9qh0KdPVzwciwYF5dF8TQ8QoeUMf3JUJoCcV7NgtNUdIaxqC1OEfGl_y4jyeuVPu_usQ8UvxsrIKjsTLP0ZE4reBTehL5yJs_4atW-d60if1npRn3R7wV6REBox-whiI8zs91zkvSDpCJHhIA7sRv0Rm0W7OeIRG6QucXj1wp8r8Z3bGr_O83AiO6zs_q9HV3pVDMeGzQWUxhs-85D4SEYPPD6pb3JAw";

export const exampleUserInfoResponse: UserInfoResponse = {
  sub: "google-oauth2|000000000000000000000",
  given_name: "Test",
  family_name: "User",
  nickname: "test.user",
  name: "Test User",
  picture: "",
  updated_at: "2024-07-09T23:16:49.277Z",
  email: "test.user@example.com",
  email_verified: true,
};

export const exampleUser: User = {
  created_at: "2024-05-13T17:22:15.504Z",
  email: "test.user@example.com",
  email_verified: true,
  family_name: "User",
  given_name: "Test",
  identities: [
    {
      provider: "google-oauth2",
      access_token: "",
      expires_in: 3599,
      user_id: "000000000000000000000",
      connection: "google-oauth2",
      isSocial: true,
    },
  ],
  idp_tenant_domain: "mx.com",
  name: "Test User",
  nickname: "test.user",
  picture:
    "https://login.universalconnectproject.org/assets/logo-small-grey-white-dbafd52d.svg",
  updated_at: "2024-06-20T17:02:12.345Z",
  user_id: "google-oauth2|000000000000000000000",
  last_ip: "0.0.0.0",
  last_login: "2024-06-20T17:02:12.344Z",
  logins_count: 5,
};

export const exampleUserWithClientId: User = {
  ...exampleUser,
  user_metadata: {
    client_id: "test-client-id",
  },
};

export const exampleUserAlreadyHasAClientError = {
  error: {
    message: "User already has a client",
  },
};

export const exampleUserAlreadyHasAClientResponseError = new ResponseError(
  400,
  exampleUserAlreadyHasAClientError.error.message,
  {} as Headers,
);
