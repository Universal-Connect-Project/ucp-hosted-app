import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import Routes from "./Routes";

import "@fontsource/work-sans/300.css";
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/500.css";
import "@fontsource/work-sans/700.css";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material";
import { muiTheme } from "./theme";

const App: React.FC = () => {
  return (
    <CssVarsProvider theme={muiTheme}>
      <Auth0Provider
        domain="dev-d23wau8o0uc5hw8n.us.auth0.com"
        clientId="osS8CuafkPsJlfz5mfKRgYH942Pmwpxd"
        authorizationParams={{
          audience: "https://dev-d23wau8o0uc5hw8n.us.auth0.com/api/v2/",
          redirect_uri: window.location.origin,
        }}
      >
        <Routes />
      </Auth0Provider>
    </CssVarsProvider>
  );
};

export default App;
