import React from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GenericError from "./GenericError/GenericError";
import ApiKeys from "./ApiKeys/ApiKeys";
import Layout from "./Layout/Layout";
import Institutions from "./Institutions/Institutions";
import Institution from "./Institutions/Institution/Institution";
import {
  institutionRoute,
  widgetManagementRoute,
} from "./shared/constants/routes";

const Routes = () => {
  const router = createBrowserRouter([
    {
      children: [
        {
          path: "",
          element: <Institutions />,
        },
        {
          path: institutionRoute.childRoute,
          element: <Institution />,
        },
        {
          path: widgetManagementRoute.childRoute,
          element: <ApiKeys />,
        },
      ],
      path: "/",
      element: <Layout />,
      errorElement: <GenericError />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default withAuthenticationRequired(Routes);
