import envs from "@/config";
import { WidgetHostPermissions } from "@/shared/enums";
import { sign, Algorithm, JwtPayload, SignOptions } from "jsonwebtoken";
import { UserInfoResponse } from "auth0";
import { User } from "@/shared/users/usersModel";

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
  doAddWidgetRolePermissions: boolean = true,
): string => {
  let token: string;
  const testKey =
    "-----BEGIN RSA PRIVATE KEY-----\n" +
    "MIIEowIBAAKCAQEAlUSoj0fix14FWMlIeBQg3C+3ck6fl7sBa7GufQwK1zHgdi74\n" +
    "emGmM4NTLOwVQbV8k4cqrYv9yQ+eE/Kc+kbFRrocAfdNprCjYWXFa/+xladlm4SW\n" +
    "Z2ZrmWovCxQF/M8av6i/LBpeMSjcHkbT7hJm3hV3Jqic5bzsAgtucIxRb5B6e1Fu\n" +
    "Bqj5+Q8yEm5vzWWGMFskMq5xY14j14EdMm8MXHK0G2EisQkupg1cXHzWMZVjKyvw\n" +
    "9uLxb/hrSbxu56ue2HGJ14XnASxOm7lRDERP8sSrLUEP444IQQOY1z1kN9cbiCau\n" +
    "O1BjhukfUBKuWIZ1yS0+zIxSHHQPaNTr1vlJ3wIDAQABAoIBACMACWInYfaLhkdu\n" +
    "Uw7M8XOPwL0N0IAcelXNQPPTSgtxh4dOtjbEBNuZVHx5EvboXkCddhVheO2XOuLE\n" +
    "hahtxb4yz3Rqj4uhaX3iBiuvte04ZivUKAwwyNQdQNChLlI8IbKFF+Z4fFOcmBiF\n" +
    "VRZCvFogwGKRMNDxvokwMwIy9Llq1IOyxdzLVIOnjZ0YffNkKYk9BfuM7iKeOq4V\n" +
    "6T+oeexjhYJbhIpn9Wgde1CIssQhA06RDKKJ75UyQgCBGA/ovoFH0wE88U9un2S8\n" +
    "dxB2kygbIzuUPQ+Rw9SZSJ29VrApvGRThjqW/N8LCXK169n+jgGhH8uvZnuaAuci\n" +
    "sdQD9CkCgYEAvP6FFIajYTOrW0UvoexScbivhITwkImTqFmrsp8t00edIdbL0Q+J\n" +
    "ApGP7tL50iYvHIcWzSN7affQU2zrw9Z86b/rOCnrTjYhqysu7DXNP77MFQvZ26L8\n" +
    "RtFzwEaygrffFYX6EZ3gt+lEuRWxzf3uA8Krat9CbcK5aQpoXbgziB0CgYEAyjCH\n" +
    "OMWv2OzneYAHXK7HZiPmNcRzEVHL/k9clRzuEV5PXhf8ikomGYVGFEtSv9yf4DHU\n" +
    "JkgTNy/kZ3JpePThxNaVJBCGvytdjbXPtzOP3/85N8+/yVIhhEp6FetrI2DPLs43\n" +
    "TDMhjFzjz+8fi/oh90/FhfLuzCDQP5Aw/+PNkSsCgYEApkmPUDsSf5DVwY2DVoY3\n" +
    "GAY2sHPDsnjKKYMUdipmSJKnJ8H1PPHdTBxFNw38bzHXm9MkdcQ1b0xyySR54KrU\n" +
    "51pMnPMNLZilURTCyWShPegjapUtz3l9XNYncVMC987OgwKJv3xY35hoNi1nb2Zw\n" +
    "SHC9IGBl82s0db6Ji4RqGuUCgYADRGN6/F7KD5Hx+aqkycI5GU1oAwOk/QBh3KBv\n" +
    "XGdQaoi3yYVwKqCQ+wFV5J2ysfr3YXa/I50D4Ec9kLC5nqNjTeBdE9NJlYbOemif\n" +
    "2jpx8SrYhwffVe9qttVgM0yo5rCSXgyws4bQQNQBkSieV21jFKvpbTKEo+cZj9fq\n" +
    "2qCAvwKBgHxDPQlGRQ/3ZBoMLecWxL0UmUgyFn1X3oPC5gLkZeisFoenkO5kittZ\n" +
    "Bffjb/S24sTlYHctaCmVo79p45JigXq81UxECoL6taHd3Cj27JT+f2t6ZSw7dOEu\n" +
    "DQJPG22XIw9j42GP/OWl6C0eIq/LYmGQjO+64XbBAGk7CGKIjBS8\n" +
    "-----END RSA PRIVATE KEY-----";

  const payload: JwtPayload = {
    sub: exampleUserID,
    scope: "openid profile email",
  };

  if (doAddWidgetRolePermissions) {
    payload["permissions"] = [
      WidgetHostPermissions.CREATE_KEYS,
      WidgetHostPermissions.READ_KEYS,
      WidgetHostPermissions.ROTATE_KEYS,
      WidgetHostPermissions.DELETE_KEYS,
    ];
  }

  const options: SignOptions = {
    header: {
      alg: "RS256" as Algorithm,
      kid: "0",
    },
    algorithm: "RS256" as Algorithm,
    audience: [
      `https://${envs.AUTH0_DOMAIN}/api/v2/`,
      `https://${envs.AUTH0_DOMAIN}/userinfo`,
    ],
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
    token = sign(payload, testKey, options);
  } catch (err) {
    console.log(err);
    throw err;
  }

  return token;
};
