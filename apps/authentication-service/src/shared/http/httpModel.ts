type IHttpService = {
  unregisterInterceptor: () => void;
};

type IHttpDataRequest = {
  [key: string]: Request;
};

type IHttpRefreshCallback = () => void;
type IHttpRequestOptions = [url: string, config: Request];

export {
  IHttpService,
  IHttpDataRequest,
  IHttpRequestOptions,
  IHttpRefreshCallback,
};
