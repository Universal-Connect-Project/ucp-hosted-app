import { User } from "@/shared/users/usersService";

export const exampleUserId = "auth0|667c3d0c90b963e3671f411e";
export const exampleToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImwwTlV3MktRaWZfZVNrR3Y3M1FrMyJ9.eyJpc3MiOiJodHRwczovL2Rldi1kMjN3YXU4bzB1YzVodzhuLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDExNTU0NTcwMzIwMTg2NTQ2MTA1OSIsImF1ZCI6WyJodHRwczovL2Rldi1kMjN3YXU4bzB1YzVodzhuLnVzLmF1dGgwLmNvbS9hcGkvdjIvIiwiaHR0cHM6Ly9kZXYtZDIzd2F1OG8wdWM1aHc4bi51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzE5MzM3OTIwLCJleHAiOjE3MTk0MjQzMjAsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhenAiOiJvc1M4Q3VhZmtQc0psZno1bWZLUmdZSDk0MlBtd3B4ZCJ9.L59hmDpHruQvrTnchA2Ixed6xtASe4Th5KRzDy4FwKAnQpjoTTQevXAPuUVF28n9ork6hU6U1upqtt2J4n4aMg0MdURns9T3SEoEyiYl-WM-Lh_YuW6VPC7vQtBYXIwykjcyBapVrh_K_kg4C1rR5ne1sFI6y9GQQgn05CDqMVH-gtAF7xfoyLl519Lcr860KjU8mQCdNFvddq1w_Dmes4RIoy-j_oUTqEPhUejsLBPNyBxNPmg0-5yV8ALnGNI1FtX9hBQbO5uCYSVcdngZgNRq_7IsJKh4vHJLQzJbAki_lQT3dba_B4WrjSLlQ-9tiFI02BjgylY5nvHX5Upgvg";

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
