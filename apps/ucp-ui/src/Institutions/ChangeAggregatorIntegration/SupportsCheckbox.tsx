import React from "react";
import styles from "./supportsCheckbox.module.css";
import { Checkbox, Typography } from "@mui/material";
import { Control, Controller } from "react-hook-form";

const SupportsCheckbox = ({
  control,
  description,
  label,
  name,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  description: string;
  label: string;
  name: string;
}) => (
  <div className={styles.container}>
    <Controller
      name={name}
      control={control}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render={({ field: { ref, ...fieldProps } }) => (
        <Checkbox inputProps={{ id: label }} {...fieldProps} />
      )}
    />
    <div className={styles.textContainer}>
      <Typography component="label" htmlFor={label} variant="body1">
        {label}
      </Typography>
      <Typography className={styles.description} variant="caption">
        {description}
      </Typography>
    </div>
  </div>
);

export default SupportsCheckbox;
