import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import Routes from "./Routes";

const App: React.FC = () => {
  return (
    <Auth0Provider
      domain="dev-d23wau8o0uc5hw8n.us.auth0.com"
      clientId="osS8CuafkPsJlfz5mfKRgYH942Pmwpxd"
      authorizationParams={{
        audience: "ucp-hosted-apps",
        redirect_uri: window.location.origin,
      }}
    >
      <Routes />
    </Auth0Provider>
  );
};

export default App;
