type IAuthService = {
  fetchAccessToken: () => Promise<string>;
  getAccessToken: () => Promise<string>;
  isTokenExpired: (token: string) => boolean;
};

export { IAuthService };
