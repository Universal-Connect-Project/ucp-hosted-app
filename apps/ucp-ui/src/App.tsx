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
// import { DefaultPermissions, WidgetHostPermissions } from "@repo/shared-utils";
import {
  DefaultPermissions,
  WidgetHostPermissions,
} from "./shared/constants/roles";

const App: React.FC = () => {
  const scope = `${Object.values(DefaultPermissions).join(" ")} ${Object.values(WidgetHostPermissions).join(" ")}`;

  return (
    <CssVarsProvider theme={muiTheme}>
      <ReduxProvider store={store}>
        <Auth0Provider
          domain="dev-d23wau8o0uc5hw8n.us.auth0.com"
          clientId="osS8CuafkPsJlfz5mfKRgYH942Pmwpxd"
          authorizationParams={{
            audience: "ucp-hosted-apps",
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
  );
};

export default App;
