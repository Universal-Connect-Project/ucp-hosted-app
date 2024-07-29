export type ICredentialRequestBody = {
  grant_type: "client_credentials";
  client_id: string;
  client_secret: string;
  audience: string;
};
