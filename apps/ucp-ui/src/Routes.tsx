import React from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ApiKeys from "./ApiKeys/ApiKeys";
import Layout from "./Layout/Layout";
import Institutions from "./Institutions/Institutions";

const Routes = () => {
  const router = createBrowserRouter([
    {
      children: [
        {
          path: "",
          element: <Institutions />,
        },
        {
          path: "widget-management",
          element: <ApiKeys />,
        },
      ],
      path: "/",
      element: <Layout />,
      errorElement: "Something went wrong",
    },
  ]);

  return <RouterProvider router={router} />;
};

export default withAuthenticationRequired(Routes);
