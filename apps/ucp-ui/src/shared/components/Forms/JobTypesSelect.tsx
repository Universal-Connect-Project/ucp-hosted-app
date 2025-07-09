import {
  Checkbox,
  ListItemText,
  MenuItem,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import React, { ChangeEvent, useState } from "react";
import {
  allJobTypes,
  jobTypesCombinationsWithMoreThanOne,
  supportsJobTypeMap,
} from "../../constants/jobTypes";
import styles from "./jobTypesSelect.module.css";
import classNames from "classnames";
import { JOB_TYPES_LABEL_TEXT, JOB_TYPES_UNSELECTED_TEXT } from "./constants";

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

const valueToLabelMap: Record<string, string> | undefined = options.reduce(
  (acc: Record<string, string>, { label, value }) => ({
    ...acc,
    [value]: label,
  }),
  {},
);

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
        inputLabel: {
          shrink: true,
        },
        select: {
          displayEmpty: true,
          multiple: true,
          renderValue: (selected: unknown) => {
            const selectedArray = selected as string[];

            if (!selectedArray || selectedArray.length === 0) {
              return JOB_TYPES_UNSELECTED_TEXT;
            }

            return selectedArray
              .map((value) => valueToLabelMap?.[value])
              .join(", ");
          },
        },
      }}
      onChange={onChange}
      value={value}
    >
      {options?.map(({ label, value: currentValue }, index) => (
        <MenuItem
          className={classNames({
            [styles.topBorder]: index === allJobTypes.length,
          })}
          key={currentValue}
          value={currentValue}
        >
          <Checkbox checked={value?.includes(currentValue)} />
          <ListItemText primary={label} />
        </MenuItem>
      ))}
    </TextField>
  );
};

export default JobTypesSelect;
