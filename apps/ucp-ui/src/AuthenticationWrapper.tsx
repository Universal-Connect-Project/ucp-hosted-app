import { useAuth0 } from "@auth0/auth0-react";
import { CircularProgress } from "@mui/material";
import React, { ReactNode, useEffect } from "react";
import styles from "./authenticationWrapper.module.css";
import { useAppDispatch, useAppSelector } from "./shared/utils/redux";
import { getAccessToken, setAccessToken } from "./shared/reducers/token";

const AuthenticationWrapper = ({ children }: { children: ReactNode }) => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  const dispatch = useAppDispatch();

  const isTokenReady = !!useAppSelector(getAccessToken);

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

  if (isLoading || !isTokenReady) {
    return (
      <div className={styles.loadingWrapper}>
        <CircularProgress size={100} />
      </div>
    );
  }

  return children;
};

export default AuthenticationWrapper;
