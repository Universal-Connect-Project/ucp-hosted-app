import { ResponseError } from "auth0";
import fetchIntercept, { FetchInterceptorResponse } from "fetch-intercept";

import AuthService, { authEndpoint } from "@/shared/auth/auth.service";
import { IAuthService } from "@/shared/auth/auth.model";
import {
  IHttpDataRequest,
  IHttpRefreshCallback,
  IHttpRequestOptions,
  IHttpService,
} from "@/shared/http/https.model";
import { ISingleton } from "@/shared/models";

const getRelativeUrl = (url: string): string => {
  const _url = new URL(url);

  return url.replace(_url.origin, "");
};

const handleErrors = async (response: Response) => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response.json();
};

const HttpService: ISingleton<IHttpService> = (() => {
  let instance: IHttpService;
  let Auth: IAuthService;

  let refreshSubscribers: IHttpRefreshCallback[] = [];
  let dataRequests = {} as IHttpDataRequest;

  const subscribeTokenRefresh = (callback: IHttpRefreshCallback): void => {
    refreshSubscribers.push(callback);
  };

  const onRefreshed = () => {
    refreshSubscribers.map((callback: IHttpRefreshCallback) => callback());
    refreshSubscribers = [];
  };

  const removeDataRequestsItem = (requestKey: string) => {
    const { [requestKey]: _omit, ...remaining } = dataRequests;
    dataRequests = remaining;
  };

  const createInstance = (): IHttpService => {
    let isRefreshing = false;
    Auth = AuthService.getInstance();

    const unregisterInterceptor = fetchIntercept.register({
      request: (url, config: Request): IHttpRequestOptions => {
        console.log(`Intercepted request: ${url}, method: ${config.method}`);

        if (config && url.includes(authEndpoint)) {
          dataRequests = {
            ...dataRequests,
            [`${getRelativeUrl(url)}_${config.method || "GET"}`]: config,
          };
        }

        return [url, config];
      },

      response: (
        response: FetchInterceptorResponse,
      ): FetchInterceptorResponse => {
        console.log(
          `Intercepted response: ${response.url}, method: ${response.request.method}, status: ${response.status}`,
        );

        const requestKey: string = `${getRelativeUrl(response.url)}_${response.request.method}`;

        if (response.status === 401 && response.url.includes(authEndpoint)) {
          if (!isRefreshing) {
            isRefreshing = true;
            Auth.fetchAccessToken()
              .then(() => {
                onRefreshed();
              })
              .catch(() => {
                // TODO: Handle logging
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          const retryOrigReq: Promise<FetchInterceptorResponse> =
            new Promise<FetchInterceptorResponse>((resolve, reject) => {
              subscribeTokenRefresh(() => {
                fetch(response.url, {
                  ...dataRequests[requestKey],
                })
                  .then((origReqResponse) => {
                    resolve({
                      ...origReqResponse,
                    } as FetchInterceptorResponse);
                  })
                  .catch((err) => {
                    reject(err);
                  })
                  .finally(() => {
                    removeDataRequestsItem(requestKey);
                  });
              });
            });

          retryOrigReq
            .then((response: FetchInterceptorResponse) => {
              return response;
            })
            .catch((reason) => {
              throw new ResponseError(
                401,
                reason as string,
                response.headers,
                reason as string,
              );
            });
        }

        removeDataRequestsItem(requestKey);
        return response;
      },
    });

    return {
      unregisterInterceptor,
    };
  };

  return {
    getInstance: () => {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

export default HttpService;
export { handleErrors };
