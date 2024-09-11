import { Auth0Provider } from "@auth0/auth0-react";
import { Provider as ReduxProvider } from "react-redux";
import React from "react";
import Routes from "./Routes";

import "@fontsource/work-sans/300.css";
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/500.css";
import "@fontsource/work-sans/700.css";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material";
import { muiTheme } from "./theme";
import { store } from "./store";
import AuthenticationWrapper from "./AuthenticationWrapper";
import {
  AUTH0_CLIENT_AUDIENCE,
  DefaultPermissions,
  UiClientPermissions,
} from "@repo/shared-utils";
import "./style.module.css";
import { LDProvider } from "launchdarkly-react-client-sdk";
import { LAUNCH_DARKLY_CLIENT_ID } from "./shared/constants/environment";

const App: React.FC = () => {
  const scope = `${Object.values(DefaultPermissions).join(" ")} ${Object.values(UiClientPermissions).join(" ")}`;
  return (
    <LDProvider clientSideID={LAUNCH_DARKLY_CLIENT_ID}>
      <CssVarsProvider theme={muiTheme}>
        <ReduxProvider store={store}>
          <Auth0Provider
            domain="dev-d23wau8o0uc5hw8n.us.auth0.com"
            clientId="osS8CuafkPsJlfz5mfKRgYH942Pmwpxd"
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
