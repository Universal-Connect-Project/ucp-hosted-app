import { Auth0Provider } from "@auth0/auth0-react";
import { Provider as ReduxProvider } from "react-redux";
import React from "react";
import Routes from "./Routes";
import { CssVarsProvider } from "@mui/material/styles";
import { muiTheme } from "./theme";
import { store } from "./store";
import {
  AUTH0_CLIENT_AUDIENCE,
  DefaultPermissions,
  UiClientPermissions,
  UiUserPermissions,
} from "@repo/shared-utils";
import "./style.module.css";
import { LDProvider } from "launchdarkly-react-client-sdk";
import {
  AUTH0_CLIENT_ID,
  AUTH0_DOMAIN,
  LAUNCH_DARKLY_CLIENT_ID,
} from "./shared/constants/environment";
import AuthenticationWrapper from "./AuthenticationWrapper";

const App: React.FC = () => {
  const scope = [DefaultPermissions, UiClientPermissions, UiUserPermissions]
    .map((permissions) => Object.values(permissions))
    .reduce((acc, permissions) => [...acc, ...permissions], [])
    .join(" ");

  return (
    <LDProvider clientSideID={LAUNCH_DARKLY_CLIENT_ID}>
      <CssVarsProvider theme={muiTheme}>
        <ReduxProvider store={store}>
          <Auth0Provider
            domain={AUTH0_DOMAIN}
            clientId={AUTH0_CLIENT_ID}
            authorizationParams={{
              audience: AUTH0_CLIENT_AUDIENCE as string,
              redirect_uri: window.location.origin,
              scope,
            }}
          >
            <AuthenticationWrapper>
              <Routes />
            </AuthenticationWrapper>
          </Auth0Provider>
        </ReduxProvider>
      </CssVarsProvider>
    </LDProvider>
  );
};

export default App;
