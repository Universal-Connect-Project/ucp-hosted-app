import { testRSAToken } from "@repo/shared-utils";
import { Algorithm, JwtPayload, sign, SignOptions } from "jsonwebtoken";

export const createTestAuthorization = ({
  aggregatorId = "mx",
  permissions = [],
}: {
  aggregatorId?: string;
  permissions: string[];
}) => {
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
      aggregatorId,
    },
  };

  return `Bearer ${sign(payload, testRSAToken, options)}`;
};
