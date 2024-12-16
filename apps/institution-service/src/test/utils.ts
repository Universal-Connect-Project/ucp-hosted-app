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

export const checkIsSorted = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arr: Record<string, any>[],
  prop: string,
  direction: "asc" | "desc",
) => {
  for (let i = 1; i < arr.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const a = arr[i - 1][prop];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const b = arr[i][prop];

    if (direction === "asc") {
      if (a > b) return false;
    } else {
      if (a < b) return false;
    }
  }

  return true;
};
