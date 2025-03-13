import { Request } from "express";

export const getAccessTokenFromRequest = (req: Request) => {
  return (req?.headers?.authorization || "Bearer ").split(" ")[1];
};