import { useAuth0 } from "@auth0/auth0-react";
import { CircularProgress } from "@mui/material";
import React, { ReactNode, useEffect } from "react";
import styles from "./authenticationWrapper.module.css";
import { useAppDispatch, useAppSelector } from "./shared/utils/redux";
import { getAccessToken, setAccessToken } from "./shared/reducers/token";
import {
  ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  AUTH0_LOADING_TEST_ID,
} from "./shared/constants/authentication";

const AuthenticationWrapper = ({ children }: { children: ReactNode }) => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  const dispatch = useAppDispatch();

  const isTokenReady = !!useAppSelector(getAccessToken);

  useEffect(
    () => {
      const storeAccessToken = async () => {
        const token = await getAccessTokenSilently();

        dispatch(setAccessToken(token));

        window.localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, token);
      };

      if (isAuthenticated) {
        void storeAccessToken();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated],
  );

  if (isLoading || (isAuthenticated && !isTokenReady)) {
    return (
      <div className={styles.loadingWrapper}>
        <CircularProgress data-testid={AUTH0_LOADING_TEST_ID} size={100} />
      </div>
    );
  }

  return children;
};

export default AuthenticationWrapper;
