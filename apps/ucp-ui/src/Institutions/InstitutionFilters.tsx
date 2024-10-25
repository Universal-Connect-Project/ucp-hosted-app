import React, { ChangeEvent, useEffect, useMemo } from "react";
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
import { useGetAggregatorsQuery } from "../shared/api/aggregators";
import { useAppDispatch } from "../shared/utils/redux";
import {
  clearInstitutionFilters,
  InstitutionFilterBooleans,
  setFilterAggregator,
  setFilterBoolean,
  setSearch,
} from "./institutionFiltersSlice";

const InstitutionFilters = () => {
  const dispatch = useAppDispatch();

  useEffect(
    () => () => {
      dispatch(clearInstitutionFilters());
    },
    [dispatch],
  );

  const debouncedUpdateSearch = useMemo(
    () =>
      debounce(
        ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
          dispatch(setSearch(value)),
        250,
      ),
    [dispatch],
  );

  const { data: aggregatorsData } = useGetAggregatorsQuery();

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
                  dispatch(
                    setFilterBoolean({
                      key: prop as keyof InstitutionFilterBooleans,
                      value: checked,
                    }),
                  )
                }
              />
            }
            key={prop}
            label={label}
          />
        ))}
        <FormHelperText>Filter by Aggregator</FormHelperText>
        {aggregatorsData?.aggregators?.map(({ displayName, name, id }) => (
          <FormControlLabel
            control={
              <Checkbox
                onChange={({ target: { checked } }) =>
                  dispatch(
                    setFilterAggregator({
                      name,
                      value: checked,
                    }),
                  )
                }
              />
            }
            key={id}
            label={displayName}
          />
        ))}
        <FormHelperText>Other Features</FormHelperText>
        <FormControlLabel
          className={styles.input}
          control={
            <Switch
              onChange={({ target: { checked } }) =>
                dispatch(
                  setFilterBoolean({
                    key: "supportsOauth",
                    value: checked,
                  }),
                )
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
