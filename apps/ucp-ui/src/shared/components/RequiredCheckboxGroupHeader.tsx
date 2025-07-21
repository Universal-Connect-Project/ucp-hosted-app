import React from "react";
import { Typography } from "@mui/material";

interface RequiredCheckboxGroupHeaderProps {
  title: string;
  error: boolean;
  errorMessage: string;
}

export const RequiredCheckboxGroupHeader: React.FC<
  RequiredCheckboxGroupHeaderProps
> = ({ title, error, errorMessage }) => {
  return (
    <div>
      <Typography color={error ? "error" : "textPrimary"} variant="body1">
        {`${title}*`}
      </Typography>
      <Typography variant="caption" color={error ? "error" : "textSecondary"}>
        {`*${errorMessage}`}
      </Typography>
    </div>
  );
};
