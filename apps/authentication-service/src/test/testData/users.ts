import envs from "@/config";
import { sign, Algorithm, JwtPayload, SignOptions } from "jsonwebtoken";
import { UserInfoResponse } from "auth0";
import { User } from "@/shared/users/usersModel";
import {
  AUTH0_CLIENT_AUDIENCE,
  DefaultPermissions,
  testRSAToken,
  UiClientPermissions,
} from "@repo/shared-utils";

export const exampleUserID = "google-oauth2|0000000000000000000000000000000";
export const exampleClientID: string = "test-client-id";

export const exampleApiToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlZ0SXZBUTZaMGZ2TUxESlJCVXRwViJ9.eyJpc3MiOiJodHRwczovL2Rldi11Y3AudXMuYXV0aDAuY29tLyIsInN1YiI6InpUQm14eGR4ZE9pS1pOclZpUEgxSTVSVEluMzlqQndUQGNsaWVudHMiLCJhdWQiOiJ0ZXN0LXVjcC1hdXRoLWFwaSIsImlhdCI6MTcxNzUzMDg4OSwiZXhwIjoxNzE3NjE3Mjg5LCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJ6VEJteHhkeGRPaUtaTnJWaVBIMUk1UlRJbjM5akJ3VCIsInBlcm1pc3Npb25zIjpbXX0.gxC5BoH77ryoHpz8Eoby94sf6qRsaFtK-IATJsKJ8bCHgXvvROLngUK9k3ojkjl0zI-oAH7QNlKsxUwqtNSmVzoJFuXlrl2976hJFpByICF1eke_tpM5za9qh0KdPVzwciwYF5dF8TQ8QoeUMf3JUJoCcV7NgtNUdIaxqC1OEfGl_y4jyeuVPu_usQ8UvxsrIKjsTLP0ZE4reBTehL5yJs_4atW-d60if1npRn3R7wV6REBox-whiI8zs91zkvSDpCJHhIA7sRv0Rm0W7OeIRG6QucXj1wp8r8Z3bGr_O83AiO6zs_q9HV3pVDMeGzQWUxhs-85D4SEYPPD6pb3JAw";
export const exampleCachedToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImwwTlV3MktRaWZfZVNrR3Y3M1FrMyJ9.eyJpc3MiOiJodHRwczovL2Rldi1kMjN3YXU4bzB1YzVodzhuLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJtR1k1RUhDZGc5cVdaMGtYeHhJaGVRQkZmNjk1REVQS0BjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9kZXYtZDIzd2F1OG8wdWM1aHc4bi51cy5hdXRoMC5jb20vYXBpL3YyLyIsImlhdCI6MTcyMTA3NDg4MywiZXhwIjoxNzIxMTYxMjgzLCJzY29wZSI6InJlYWQ6Y2xpZW50X2dyYW50cyBjcmVhdGU6Y2xpZW50X2dyYW50cyBkZWxldGU6Y2xpZW50X2dyYW50cyB1cGRhdGU6Y2xpZW50X2dyYW50cyByZWFkOnVzZXJzIHVwZGF0ZTp1c2VycyBkZWxldGU6dXNlcnMgY3JlYXRlOnVzZXJzIHJlYWQ6dXNlcnNfYXBwX21ldGFkYXRhIHVwZGF0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgZGVsZXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBjcmVhdGU6dXNlcnNfYXBwX21ldGFkYXRhIHJlYWQ6Y2xpZW50cyB1cGRhdGU6Y2xpZW50cyBkZWxldGU6Y2xpZW50cyBjcmVhdGU6Y2xpZW50cyByZWFkOmNsaWVudF9rZXlzIHVwZGF0ZTpjbGllbnRfa2V5cyBkZWxldGU6Y2xpZW50X2tleXMgY3JlYXRlOmNsaWVudF9rZXlzIHJlYWQ6dXNlcl9pZHBfdG9rZW5zIHJlYWQ6Y2xpZW50X2NyZWRlbnRpYWxzIGNyZWF0ZTpjbGllbnRfY3JlZGVudGlhbHMgdXBkYXRlOmNsaWVudF9jcmVkZW50aWFscyBkZWxldGU6Y2xpZW50X2NyZWRlbnRpYWxzIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXpwIjoibUdZNUVIQ2RnOXFXWjBrWHh4SWhlUUJGZjY5NURFUEsifQ.elOTeSWawWmn2H5yCOybGN8zZoIcPkX9tCzePdbYYcasmmlVyx9MXb8aMzoq4896JEAq9_THfsmruu2ZC46HzvZGsf8EVLtGkskAlo20MhiiDiqhLl2ks1USwDrrxssZJO7vatTarNi3XKiHISDg-lgek70z3Y06PL_XlzDLTjhhVvk2732lGma7il0sbAslUNveukawBy5g1k6-_GzhKKlf8BctLTY9BCYLFLOpITTCmYACV7zWTDjAt4oo_U8lqylLFq-1ecdev-_ML2TDyVzzweJfImcc5b8-1PtJx36ObsLW05MqkhBZ5DQLkNFgR00mdqWfOu6dvkENBMt7EA";

export const exampleUserInfoResponse: UserInfoResponse = {
  sub: exampleUserID,
  given_name: "Test",
  family_name: "User",
  nickname: "test.user",
  name: "Test User",
  picture: "",
  updated_at: "2024-07-09T23:16:49.277Z",
  email: "test.user@example.com",
  email_verified: true,
};

export const exampleUserWithoutClient: User = {
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
  user_id: exampleUserID,
  last_ip: "0.0.0.0",
  last_login: "2024-06-20T17:02:12.344Z",
  logins_count: 5,
};

export const exampleUserWithClientId: User = {
  ...exampleUserWithoutClient,
  user_metadata: {
    client_id: "test-client-id",
  },
};

export const exampleUserAlreadyHasAClientError = {
  error: {
    message: "User already has a client",
  },
};

export const exampleUserAlreadyHasAClientResponseError =
  exampleUserAlreadyHasAClientError.error.message;

export const getTestToken = (
  isExpired: boolean = false,
  shouldAddKeyRoles: boolean = true,
): string => {
  let token: string;

  const payload: JwtPayload = {
    sub: exampleUserID,
    scope: shouldAddKeyRoles
      ? `${Object.values(DefaultPermissions).join(" ")} ${Object.values(UiClientPermissions).join(" ")}`
      : `${Object.values(DefaultPermissions).join(" ")}`,
    azp: "osS8CuafkPsJlfz5mfKRgYH942Pmwpxd",
  };

  if (shouldAddKeyRoles) {
    payload["ucw/roles"] = ["WidgetHost"];
    payload["permissions"] = Object.values(UiClientPermissions);
  }

  const options: SignOptions = {
    header: {
      alg: "RS256" as Algorithm,
      kid: "0",
    },
    algorithm: "RS256" as Algorithm,
    audience: [AUTH0_CLIENT_AUDIENCE, `https://${envs.AUTH0_DOMAIN}/userinfo`],
    issuer: `https://${envs.AUTH0_DOMAIN}/`,
  };

  if (!isExpired) {
    payload.iat = 0;
    options.expiresIn = "1d";
  }

  if (isExpired) {
    payload.iat = 1717530889;
    payload.exp = 1717617289;
  }

  try {
    token = sign(payload, testRSAToken, options);
  } catch (err) {
    console.log(err);
    throw err;
  }

  return token;
};
