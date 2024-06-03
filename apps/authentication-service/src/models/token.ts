export type Token = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export const createToken = (
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): Token => ({
  accessToken,
  refreshToken,
  expiresIn,
});
