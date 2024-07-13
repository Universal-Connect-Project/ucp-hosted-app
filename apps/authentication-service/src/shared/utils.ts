import { Request } from "express";

export const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response.body ? response.json() : null;
};

export const getClientTokenFromRequest = (
  req: Request<object, object, never>,
) => {
  return (req?.headers?.authorization || "Bearer ").split(" ")[1];
};
