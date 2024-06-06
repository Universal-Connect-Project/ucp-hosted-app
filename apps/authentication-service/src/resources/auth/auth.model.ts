export type AuthenticationService = {
  fetchAccessToken: () => Promise<void>;
  getAccessToken: () => Promise<string>;
  isTokenExpired: (token: string) => boolean;
};

export type Singleton<T> = {
  getInstance: () => T;
};
