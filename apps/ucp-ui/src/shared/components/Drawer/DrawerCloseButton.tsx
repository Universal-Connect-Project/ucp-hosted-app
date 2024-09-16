import { Close } from "@mui/icons-material";
import { Button } from "@mui/material";
import React, { MouseEventHandler, ReactNode } from "react";

const DrawerCloseButton = ({
  children,
  handleClose,
}: {
  children: ReactNode;
  handleClose: MouseEventHandler;
}) => {
  return (
    <Button
      color="inherit"
      onClick={handleClose}
      startIcon={<Close />}
      variant="text"
    >
      {children}
    </Button>
  );
};

export default DrawerCloseButton;
