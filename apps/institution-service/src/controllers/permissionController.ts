import { UiUserPermissions } from "@repo/shared-utils";
import { Request, Response } from "express";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../middlewares/validationMiddleware";

export const getPermissions = (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")?.[1];
  const decodedToken = jwtDecode<DecodedToken>(token as string);

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
