let storageObject: Record<string, unknown> = {};

export const clearRedisMock = () => {
  storageObject = {};
};

export const del = jest.fn((key: string) => {
  delete storageObject[key];
});

export const get = jest.fn((key: string) => {
  return storageObject[key];
});

export const set = jest.fn(
  (key: string, value: unknown, _params: object = {}) => {
    storageObject[key] = value;
  },
);

export const keys = jest.fn((_key: string) => {
  return Object.keys(storageObject).filter((key) => key.startsWith("event:"));
});

export const createClient = () => ({
  // eslint-disable-next-line @typescript-eslint/require-await
  connect: async () => {
    return true;
  },
  get,
  isReady: true,
  set,
  del,
  keys,
});
