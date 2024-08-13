import React from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ApiKeys from "./ApiKeys/ApiKeys";
import Layout from "./Layout";
import useSetToken from "./Token/useSetToken";

const Routes = () => {
  const { isTokenReady } = useSetToken();

  const router = createBrowserRouter([
    {
      path: "*",
      element: "Not found",
    },
    {
      path: "/",
      element: <ApiKeys />,
    },
  ]);

  if (!isTokenReady) {
    return null;
  }

  return (
    <Layout>
      <RouterProvider router={router} />
    </Layout>
  );
};

export default withAuthenticationRequired(Routes);
