import React from "react";
import styles from "./sectionHeaderSwitch.module.css";
import SectionHeader from "./SectionHeader";
import { Control, Controller } from "react-hook-form";
import { Switch } from "@mui/material";

const SectionHeaderSwitch = ({
  control,
  name,
  label,
  tooltipTitle,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
  label: string;
  tooltipTitle: string;
}) => {
  return (
    <div className={styles.container}>
      <SectionHeader
        sectionTitle={label}
        tooltipTitle={tooltipTitle}
        typographyProps={{
          component: "label",
          htmlFor: label,
        }}
      />
      <Controller
        name={name}
        control={control}
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        render={({ field: { ref, value, ...fieldProps } }) => (
          <Switch
            checked={value as boolean}
            inputProps={{ id: label }}
            {...fieldProps}
          />
        )}
      />
    </div>
  );
};

export default SectionHeaderSwitch;
