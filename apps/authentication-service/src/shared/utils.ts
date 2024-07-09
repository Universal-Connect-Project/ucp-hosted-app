export const parseResponse = async (response: Response) => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response.body ? response.json() : {};
};
