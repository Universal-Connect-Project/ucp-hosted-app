import { Request } from "express";

export const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response.body ? response.json() : response;
};

export const getClientTokenFromRequest = (req: Request) => {
  return (req?.headers?.authorization || "Bearer ").split(" ")[1];
};
