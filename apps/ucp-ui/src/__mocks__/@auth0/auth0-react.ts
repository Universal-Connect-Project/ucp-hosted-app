// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withAuthenticationRequired = (component: any): any => component;

export const useAuth0 = jest.fn(() => ({
  logout: () => {},
}));
