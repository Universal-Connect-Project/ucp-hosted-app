import React from "react";
import { Typography } from "@mui/material";
import styles from "./requiredHeader.module.css";
import classNames from "classnames";

interface RequiredHeaderProps {
  title: string;
  error: boolean;
  errorMessage: string;
}

export const RequiredHeader: React.FC<RequiredHeaderProps> = ({
  title,
  error,
  errorMessage,
}) => {
  return (
    <div>
      <Typography
        className={classNames({
          [styles.textError]: error,
        })}
        variant="body1"
      >
        {title}
      </Typography>
      <Typography
        className={classNames(styles.textSecondary, {
          [styles.textError]: error,
        })}
        variant="caption"
      >
        {errorMessage}
      </Typography>
    </div>
  );
};
