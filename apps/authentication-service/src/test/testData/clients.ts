import { Client } from "auth0";

export const exampleClient: Partial<Client> = {
  tenant: "dev-ucp",
  global: false,
  is_token_endpoint_ip_header_trusted: false,
  name: "UCP Auth APP (Dev)",
  is_first_party: true,
  oidc_conformant: true,
  sso_disabled: false,
  cross_origin_auth: false,
  refresh_token: {
    expiration_type: "non-expiring",
    leeway: 0,
    infinite_token_lifetime: true,
    infinite_idle_token_lifetime: true,
    token_lifetime: 31557600,
    idle_token_lifetime: 2592000,
    rotation_type: "non-rotating",
  },
  allowed_clients: [],
  callbacks: ["http://localhost:8089"],
  native_social_login: {
    apple: {
      enabled: false,
    },
    facebook: {
      enabled: false,
    },
  },
  allowed_logout_urls: [],
  description: "This is the main APP we are using for testing",
  initiate_login_uri: "",
  logo_uri:
    "https://login.universalconnectproject.org/assets/logo-small-grey-white-dbafd52d.svg",
  signing_keys: [
    {
      cert: "",
      pkcs7: "",
      subject: "",
    },
  ],
  allowed_origins: [],
  client_id: "zTBmxxdxdOiKZNrViPH1I5RTIn39jBwT",
  callback_url_template: false,
  client_secret: "fake-secret",
  jwt_configuration: {
    scopes: [],
    alg: "HS256",
    lifetime_in_seconds: 0,
    secret_encoded: false,
  },
  client_aliases: [],
  token_endpoint_auth_method: "client_secret_post",
  app_type: "non_interactive",
  grant_types: [
    "client_credentials",
    "password",
    "http://auth0.com/oauth/grant-type/password-realm",
  ],
  web_origins: ["http://localhost:3031"],
  custom_login_page_on: true,
};
