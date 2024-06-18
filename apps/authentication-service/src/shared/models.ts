export type ISingleton<T> = {
  getInstance: () => T;
};
