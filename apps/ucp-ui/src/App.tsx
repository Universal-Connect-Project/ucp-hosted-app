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

const App: React.FC = () => {
  return (
    <CssVarsProvider theme={muiTheme}>
      <ReduxProvider store={store}>
        <Auth0Provider
          domain="dev-d23wau8o0uc5hw8n.us.auth0.com"
          clientId="osS8CuafkPsJlfz5mfKRgYH942Pmwpxd"
          authorizationParams={{
            audience: "https://dev-d23wau8o0uc5hw8n.us.auth0.com/api/v2/",
            redirect_uri: window.location.origin,
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
