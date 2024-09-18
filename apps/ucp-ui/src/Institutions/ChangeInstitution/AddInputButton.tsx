import { Add } from "@mui/icons-material";
import { Button } from "@mui/material";
import React, { MouseEventHandler, ReactNode } from "react";

const AddInputButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: MouseEventHandler;
}) => {
  return (
    <Button onClick={onClick} startIcon={<Add />}>
      {children}
    </Button>
  );
};

export default AddInputButton;
