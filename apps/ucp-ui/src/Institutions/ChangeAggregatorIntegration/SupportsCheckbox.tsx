import React from "react";
import styles from "./supportsCheckbox.module.css";
import { Checkbox, Typography } from "@mui/material";
import { Control, Controller } from "react-hook-form";
import { CheckboxName, ChangeAggregatorIntegrationInputs } from "./constants";

const SupportsCheckbox = ({
  control,
  description,
  label,
  name,
  triggerValidation,
  validate,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  description: string;
  label: string;
  name: CheckboxName;
  triggerValidation: () => Promise<boolean>;
  validate: (
    _value: boolean,
    formState: ChangeAggregatorIntegrationInputs,
  ) => boolean;
}) => (
  <div className={styles.container}>
    <Controller
      name={name}
      control={control}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render={({ field: { ref, onChange, value, ...fieldProps } }) => (
        <Checkbox
          checked={value}
          inputProps={{ id: label }}
          onChange={(event) => {
            onChange(event);
            void triggerValidation();
          }}
          {...fieldProps}
        />
      )}
      rules={{
        validate,
      }}
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
