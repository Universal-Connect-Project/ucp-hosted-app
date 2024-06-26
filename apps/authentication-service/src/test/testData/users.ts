import { User } from "@/shared/users/usersModel";

export const exampleUserId = "auth0|667c3d0c90b963e3671f411e";
export const exampleToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImwwTlV3MktRaWZfZVNrR3Y3M1FrMyJ9.eyJpc3MiOiJodHRwczovL2Rldi1kMjN3YXU4bzB1YzVodzhuLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2NjdjM2QwYzkwYjk2M2UzNjcxZjQxMWUiLCJhdWQiOlsiaHR0cHM6Ly9kZXYtZDIzd2F1OG8wdWM1aHc4bi51cy5hdXRoMC5jb20vYXBpL3YyLyIsImh0dHBzOi8vZGV2LWQyM3dhdThvMHVjNWh3OG4udXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTcxOTQzMTgwMCwiZXhwIjoxNzE5NTE4MjAwLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIHJlYWQ6Y3VycmVudF91c2VyIHVwZGF0ZTpjdXJyZW50X3VzZXJfbWV0YWRhdGEgZGVsZXRlOmN1cnJlbnRfdXNlcl9tZXRhZGF0YSBjcmVhdGU6Y3VycmVudF91c2VyX21ldGFkYXRhIGNyZWF0ZTpjdXJyZW50X3VzZXJfZGV2aWNlX2NyZWRlbnRpYWxzIGRlbGV0ZTpjdXJyZW50X3VzZXJfZGV2aWNlX2NyZWRlbnRpYWxzIHVwZGF0ZTpjdXJyZW50X3VzZXJfaWRlbnRpdGllcyBvZmZsaW5lX2FjY2VzcyIsImd0eSI6InBhc3N3b3JkIiwiYXpwIjoib3NTOEN1YWZrUHNKbGZ6NW1mS1JnWUg5NDJQbXdweGQifQ.KSEYgZS0yioTSDMugI4Ac0ricFkb7U3d6xcB4yfyyAfuN1uhXTe9LnGF57hzLUj6TELePotUwMbkCQlmKefOp_G0uMpkRx2TCPoa8ysUCloWYigHwRWLe_rpteiOFLW6xid0QipoxrOQwd-7oKjd9bto_f7Ywy7K6Tpa20SfAF7u5qfVkp2STp_vMV5W-x-Oj8rjHucDQZI7FK28aFWp28OSz513S1O2sr2NAeRFWMahszeDYEmKquZHNWKsgIfqRYKLXaOb9c64Wp6BMH6qzOaEGy4_yQSYeE_KPjfnaZGabRC5UfAqrV1hlSK4lzDoW_AWT-STpsBe6bDHC3DmUg";

export const exampleUser: User = {
  created_at: "2024-05-13T17:22:15.504Z",
  email: "test.user@mx.com",
  email_verified: true,
  family_name: "User",
  given_name: "Test",
  identities: [
    {
      provider: "google-oauth2",
      access_token: "",
      expires_in: 3599,
      user_id: "115545703201865461059",
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
  user_id: "google-oauth2|115545703201865461059",
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
