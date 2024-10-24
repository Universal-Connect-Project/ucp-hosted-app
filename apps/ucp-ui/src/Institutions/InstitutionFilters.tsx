import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import styles from "./institutionFilters.module.css";
import TextField from "../shared/components/Forms/TextField";
import { Search } from "@mui/icons-material";
import debounce from "lodash.debounce";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Switch,
} from "@mui/material";

export interface FilterParams {
  search?: string;
}

const InstitutionFilters = ({
  updateFilterParam,
}: {
  updateFilterParam: ({
    key,
    value,
  }: {
    key: string;
    value: string | boolean;
  }) => void;
}) => {
  const [searchText, setSearchText] = useState("");

  const debouncedUpdateSearch = useMemo(
    () =>
      debounce(
        ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
          setSearchText(value),
        250,
      ),
    [],
  );

  useEffect(() => {
    updateFilterParam({
      key: "search",
      value: searchText,
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const jobTypeCheckboxes = [
    {
      label: supportsJobTypeMap.aggregation.displayName,
      prop: "supportsAggregation",
    },
    {
      label: supportsJobTypeMap.identification.displayName,
      prop: "supportsIdentification",
    },
    {
      label: supportsJobTypeMap.verification.displayName,
      prop: "supportsVerification",
    },
    {
      label: supportsJobTypeMap.fullHistory.displayName,
      prop: "supportsHistory",
    },
  ];

  return (
    <div className={styles.container}>
      <TextField
        InputProps={{
          endAdornment: <Search />,
        }}
        label="Search"
        onChange={debouncedUpdateSearch}
      />
      <FormGroup className={styles.formGroup}>
        <FormHelperText>Filter by Job Type</FormHelperText>
        {jobTypeCheckboxes.map(({ label, prop }) => (
          <FormControlLabel
            className={styles.input}
            control={
              <Checkbox
                onChange={({ target: { checked } }) =>
                  updateFilterParam({
                    key: prop,
                    value: checked,
                  })
                }
              />
            }
            key={prop}
            label={label}
          />
        ))}
        <FormHelperText>Other Features</FormHelperText>
        <FormControlLabel
          className={styles.input}
          control={
            <Switch
              onChange={({ target: { checked } }) =>
                updateFilterParam({
                  key: "supportsOauth",
                  value: checked,
                })
              }
              size="small"
            />
          }
          label="OAuth"
        />
      </FormGroup>
    </div>
  );
};

export default InstitutionFilters;
