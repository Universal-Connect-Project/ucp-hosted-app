import { MenuItem, SelectChangeEvent, TextField } from "@mui/material";
import React, { ChangeEvent, useState } from "react";
import {
  allJobTypes,
  jobTypesCombinationsWithMoreThanOne,
  supportsJobTypeMap,
} from "../../constants/jobTypes";
import styles from "./jobTypesSelect.module.css";
import classNames from "classnames";
import { JOB_TYPES_LABEL_TEXT } from "./constants";

export const useJobTypesSelect = () => {
  const [jobTypes, setJobTypes] = useState<string[]>([]);

  const handleJobTypesChange = (event: SelectChangeEvent<string>) => {
    const {
      target: { value },
    } = event;
    setJobTypes(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value,
    );
  };

  return {
    jobTypes,
    handleJobTypesChange,
  };
};

const options = [
  ...allJobTypes.map((jobType) => ({
    label: supportsJobTypeMap[jobType]?.displayName,
    value: jobType,
  })),
  ...jobTypesCombinationsWithMoreThanOne.map((jobTypes) => ({
    label: jobTypes
      .map((jobType) => supportsJobTypeMap[jobType]?.displayName)
      .join(" + "),
    value: jobTypes.join("|"),
  })),
];

const JobTypesSelect = ({
  className,
  onChange,
  value,
}: {
  className?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value: string[];
}) => {
  return (
    <TextField
      className={classNames(styles.container, className)}
      label={JOB_TYPES_LABEL_TEXT}
      select
      slotProps={{
        select: {
          multiple: true,
        },
      }}
      onChange={onChange}
      value={value}
    >
      {options?.map(({ label, value }) => (
        <MenuItem key={value} value={value}>
          {label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default JobTypesSelect;
