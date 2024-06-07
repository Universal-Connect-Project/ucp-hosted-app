type AuthService = {
  fetchAccessToken: () => Promise<void>;
  getAccessToken: () => Promise<string>;
  isTokenExpired: (token: string) => boolean;
};

export { AuthService };
