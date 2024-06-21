import { User } from "@/shared/users/userService";

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
  user_metadata: {
    client_id: "test-client-id",
  },
  last_ip: "0.0.0.0",
  last_login: "2024-06-20T17:02:12.344Z",
  logins_count: 5,
};
