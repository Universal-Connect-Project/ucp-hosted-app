import { testRSAToken } from "@repo/shared-utils";
import { Algorithm, JwtPayload, sign, SignOptions } from "jsonwebtoken";

export const createTestAuthorization = (
  args: {
    permissions?: string[];
    aggregatorId?: string;
  } = {},
) => {
  const { permissions = [], aggregatorId = "mx" } = args;
  const options: SignOptions = {
    header: {
      alg: "RS256" as Algorithm,
      kid: "0",
    },
    algorithm: "RS256" as Algorithm,
  };

  const payload: JwtPayload = {
    permissions,
    "ucw/appMetaData": {
      aggregatorId: aggregatorId,
    },
  };

  return `Bearer ${sign(payload, testRSAToken, options)}`;
};
