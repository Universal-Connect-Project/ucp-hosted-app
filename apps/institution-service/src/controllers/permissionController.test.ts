import { testRSAToken, UiUserPermissions } from "@repo/shared-utils";
import { getPermissions } from "./permissionController";
import { Request, Response } from "express";
import { Algorithm, JwtPayload, sign, SignOptions } from "jsonwebtoken";

const createTestAuthorization = (permissions: string[] = []) => {
  const options: SignOptions = {
    header: {
      alg: "RS256" as Algorithm,
      kid: "0",
    },
    algorithm: "RS256" as Algorithm,
  };

  const payload: JwtPayload = {
    permissions,
  };

  return `Bearer ${sign(payload, testRSAToken, options)}`;
};

describe("permissionController", () => {
  describe("getPermissions", () => {
    it(`returns the correct permissions for someone with ${UiUserPermissions.CREATE_INSTITUTION}`, () => {
      const req = {
        headers: {
          authorization: createTestAuthorization([
            UiUserPermissions.CREATE_INSTITUTION,
          ]),
        },
      } as Request;
      const res = {
        send: jest.fn(),
        status: jest.fn(),
      } as unknown as Response;

      getPermissions(req, res);

      expect(res.send).toHaveBeenCalledWith({
        canCreateInstitution: true,
      });
    });
    it(`returns the correct permissions for someone with ${UiUserPermissions.CREATE_INSTITUTION_AGGREGATOR}`, () => {
      const req = {
        headers: {
          authorization: createTestAuthorization([
            UiUserPermissions.CREATE_INSTITUTION_AGGREGATOR,
          ]),
        },
      } as Request;
      const res = {
        send: jest.fn(),
        status: jest.fn(),
      } as unknown as Response;

      getPermissions(req, res);

      expect(res.send).toHaveBeenCalledWith({
        canCreateInstitution: true,
      });
    });

    it(`returns the correct permissions for someone with no scopes`, () => {
      const req = {
        headers: {
          authorization: createTestAuthorization(),
        },
      } as Request;
      const res = {
        send: jest.fn(),
        status: jest.fn(),
      } as unknown as Response;

      getPermissions(req, res);

      expect(res.send).toHaveBeenCalledWith({
        canCreateInstitution: false,
      });
    });
  });
});