import { Typography } from "@mui/material";
import React, { ReactNode } from "react";

const PageTitle = ({ children }: { children: ReactNode }) => (
  <Typography variant="h3">{children}</Typography>
);

export default PageTitle;
