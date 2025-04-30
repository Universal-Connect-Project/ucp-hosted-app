import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GenericError from "./GenericError/GenericError";
import ApiKeys from "./ApiKeys/ApiKeys";
import Layout from "./Layout/Layout";
import Institutions from "./Institutions/Institutions";
import Institution from "./Institutions/Institution/Institution";
import {
  institutionRoute,
  LOGGED_OUT_TERMS_AND_CONDITIONS_ROUTE,
  TERMS_AND_CONDITIONS_ROUTE,
  widgetManagementRoute,
} from "./shared/constants/routes";
import TermsAndConditions from "./TermsAndConditions/TermsAndConditions";

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
        {
          path: TERMS_AND_CONDITIONS_ROUTE,
          element: <TermsAndConditions />,
        },
      ],
      path: "/",
      element: <Layout />,
      errorElement: <GenericError />,
    },
    {
      path: LOGGED_OUT_TERMS_AND_CONDITIONS_ROUTE,
      element: <TermsAndConditions />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
