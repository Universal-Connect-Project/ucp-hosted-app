import React, { ReactNode } from "react";
import { Button } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import Snackbars from "./Snackbars";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { logout } = useAuth0();

  return (
    <>
      <Snackbars />
      <Button onClick={() => void logout()} variant="contained">
        Log out
      </Button>
      {children}
    </>
  );
};

export default Layout;
