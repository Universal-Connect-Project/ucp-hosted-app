export type IAuthService = {
  init: () => Promise<string>;
  fetchAccessToken: (skipCache?: boolean) => Promise<string>;
  getAccessToken: (skipCache?: boolean) => Promise<string>;
  isTokenExpired: (token: string) => boolean;
};

export type ICredentialRequestBody = {
  grant_type: "client_credentials";
  client_id: string;
  client_secret: string;
  audience: string;
};
