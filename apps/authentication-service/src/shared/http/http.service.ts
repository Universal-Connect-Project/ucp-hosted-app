import { ResponseError } from "auth0";
import fetchIntercept, { FetchInterceptorResponse } from "fetch-intercept";

import { HttpService } from "@/shared/http/https.model";
import { Singleton } from "@/shared/models";

const Http: Singleton<HttpService> = (function () {
  let instance: HttpService;

  const createInstance = (): HttpService => {
    // const get = (url: string) => {
    //   return fetch(url).get(url);
    // };

    const unregisterInterceptor = fetchIntercept.register({
      request: (url, config): [url: string, config: RequestInit] => {
        console.log(`Intercepted request: ${url}`);
        // Modify the url or config here
        return [url, config];
      },

      requestError: (error): Promise<never> => {
        // Called when an error occurred during another 'request' interceptor call
        return Promise.reject(error);
      },

      response: (response): FetchInterceptorResponse => {
        // Modify the response object
        return response;
      },

      responseError: (error): Promise<ResponseError> => {
        // TODO: Handle token expiration
        // Handle an fetch error
        return Promise.reject(error);
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

export default Http;
