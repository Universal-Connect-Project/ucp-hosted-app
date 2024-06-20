import React from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const Routes = () => {
  const { logout } = useAuth0();

  const router = createBrowserRouter([
    {
      path: "*",
      element: "Not found",
    },
    {
      path: "/",
      element: (
        <>
          Hello world!
          <button onClick={() => void logout()}>Log out</button>
        </>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
};

export default withAuthenticationRequired(Routes);
