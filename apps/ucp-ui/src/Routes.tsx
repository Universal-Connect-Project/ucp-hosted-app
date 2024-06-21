import React from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home";

const Routes = () => {
  const router = createBrowserRouter([
    {
      path: "*",
      element: "Not found",
    },
    {
      path: "/",
      element: <Home />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default withAuthenticationRequired(Routes);
