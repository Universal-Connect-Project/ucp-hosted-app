import React from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ApiKeys from "./ApiKeys/ApiKeys";
import Layout from "./Layout/Layout";

const Routes = () => {
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

  return (
    <Layout>
      <RouterProvider router={router} />
    </Layout>
  );
};

export default withAuthenticationRequired(Routes);
