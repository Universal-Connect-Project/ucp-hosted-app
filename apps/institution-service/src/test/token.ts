import { testRSAToken } from "@repo/shared-utils";
import { Algorithm, JwtPayload, sign, SignOptions } from "jsonwebtoken";

const createFakeTestToken = ({
  jwtPayload = {},
}: {
  jwtPayload?: Partial<JwtPayload>;
}): string => {
  let token: string;

  const options: SignOptions = {
    header: {
      alg: "RS256" as Algorithm,
      kid: "0",
    },
    algorithm: "RS256" as Algorithm,
    audience: [],
    issuer: `https://test/`,
  };

  try {
    token = sign(jwtPayload, testRSAToken, options);
  } catch (err) {
    console.log(err);
    throw err;
  }

  return token;
};

export const createAuthorizationHeaders = ({
  jwtPayload = {},
}: {
  jwtPayload?: Partial<JwtPayload>;
}): { authorization: string } => {
  const token = createFakeTestToken({ jwtPayload });
  return { authorization: `Bearer ${token}` };
};
