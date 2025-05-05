export const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response.json() as Promise<T>;
};
