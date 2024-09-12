import { Request, Response } from "express";
import { jwtDecode } from "jwt-decode";
import { UiUserPermissions } from "@repo/shared-utils";

interface DecodedToken {
  permissions: string[];
}

export const getPermissions = (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")?.[1];
    const decodedToken = jwtDecode<DecodedToken>(token as string);

    const permissions = {
      canCreateInstitution: !!decodedToken.permissions.find((permission) =>
        [
          UiUserPermissions.CREATE_INSTITUTION,
          UiUserPermissions.CREATE_INSTITUTION_AGGREGATOR,
        ].includes(permission),
      ),
    };

    res.status(200);
    res.json(permissions);
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ error: "Error getting permissions" });
  }
};
