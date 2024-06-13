type IAuthService = {
  init: () => Promise<string>;
  fetchAccessToken: () => Promise<string>;
  getAccessToken: () => Promise<string>;
  isTokenExpired: (token: string) => boolean;
};

type ICredentialRequestBody = {
  grant_type: "client_credentials";
  client_id: string;
  client_secret: string;
  audience: string;
};

export { IAuthService, ICredentialRequestBody };
