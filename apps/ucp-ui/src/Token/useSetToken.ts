import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../shared/utils/redux";
import { getAccessToken, setAccessToken } from "./token";

const useSetToken = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const dispatch = useAppDispatch();

  useEffect(
    () => {
      const storeAccessToken = async () => {
        const token = await getAccessTokenSilently();

        dispatch(setAccessToken(token));
      };

      if (isAuthenticated) {
        void storeAccessToken();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated],
  );

  const isTokenReady = !!useAppSelector(getAccessToken);

  return {
    isTokenReady,
  };
};

export default useSetToken;
