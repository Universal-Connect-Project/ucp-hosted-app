import { UiUserPermissions } from "@repo/shared-utils";
import { Request, Response } from "express";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../middlewares/validationMiddleware";
import { getAccessTokenFromRequest } from "@repo/backend-utils";

export const getPermissions = (req: Request, res: Response) => {
  const token = getAccessTokenFromRequest(req);
  const decodedToken = jwtDecode<DecodedToken>(token);

  const permissions = {
    canCreateInstitution: [
      UiUserPermissions.CREATE_INSTITUTION,
      UiUserPermissions.CREATE_INSTITUTION_AGGREGATOR,
    ].some((permission: string) =>
      decodedToken?.permissions?.includes(permission),
    ),
  };

  res.status(200);
  res.send(permissions);
};
