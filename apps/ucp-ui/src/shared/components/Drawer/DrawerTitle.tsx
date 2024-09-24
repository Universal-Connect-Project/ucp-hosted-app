import { Typography } from "@mui/material";
import React, { ReactNode } from "react";

const DrawerTitle = ({ children }: { children: ReactNode }) => (
  <Typography variant="h5">{children}</Typography>
);

export default DrawerTitle;
