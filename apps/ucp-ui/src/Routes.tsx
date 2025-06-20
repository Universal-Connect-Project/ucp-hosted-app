import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GenericError from "./GenericError/GenericError";
import ApiKeys from "./ApiKeys/ApiKeys";
import Layout, { UnauthenticatedLayout } from "./Layout/Layout";
import Institutions from "./Institutions/Institutions";
import Institution from "./Institutions/Institution/Institution";
import {
  institutionRoute,
  termsAndConditionsRoute,
  PUBLIC_BASE_ROUTE,
  PERFORMANCE_ROUTE,
  widgetManagementRoute,
  BASE_ROUTE,
  termsAndConditionsPublicRoute,
  DEMO_ROUTE,
} from "./shared/constants/routes";
import TermsAndConditions from "./TermsAndConditions/TermsAndConditions";
import Performance from "./Performance/Performance";
import Demo from "./Demo/Demo";

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
          path: termsAndConditionsRoute.childRoute,
          element: <TermsAndConditions />,
        },
        {
          path: PERFORMANCE_ROUTE,
          element: <Performance />,
        },
        {
          path: DEMO_ROUTE,
          element: <Demo />,
        },
      ],
      path: BASE_ROUTE,
      element: <Layout />,
      errorElement: <GenericError />,
    },
    {
      children: [
        {
          path: termsAndConditionsPublicRoute.childRoute,
          element: <TermsAndConditions />,
        },
      ],
      path: PUBLIC_BASE_ROUTE,
      element: <UnauthenticatedLayout shouldShowLoggedOutExperience />,
      errorElement: <GenericError />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
