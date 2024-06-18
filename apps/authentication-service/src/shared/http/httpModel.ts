export type IHttpService = {
  unregisterInterceptor: () => void;
};

export type IHttpDataRequest = {
  [key: string]: Request;
};

export type IHttpRefreshCallback = () => void;
export type IHttpRequestOptions = [url: string, config: Request];
