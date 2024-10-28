import React, { ChangeEvent, useEffect, useMemo } from "react";
import styles from "./institutionFilters.module.css";
import TextField from "../shared/components/Forms/TextField";
import { Search } from "@mui/icons-material";
import debounce from "lodash.debounce";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";
import {
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Switch,
  TypographyProps,
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
import {
  INSTITUTIONS_FILTER_INCLUDE_INACTIVE_INTEGRATIONS_LABEL_TEXT,
  INSTITUTIONS_FILTER_OAUTH_LABEL_TEXT,
  INSTITUTIONS_FILTER_SEARCH_LABEL_TEXT,
} from "./constants";

export const jobTypeCheckboxes = [
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

  const slotProps = {
    typography: {
      variant: "body2",
    } as TypographyProps,
  };

  return (
    <div className={styles.container}>
      <TextField
        InputProps={{
          endAdornment: <Search />,
        }}
        label={INSTITUTIONS_FILTER_SEARCH_LABEL_TEXT}
        onChange={debouncedUpdateSearch}
      />
      <FormGroup className={styles.formGroup}>
        <FormHelperText>Aggregator</FormHelperText>
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
            slotProps={slotProps}
          />
        ))}
        <FormHelperText>Filter by Job Type</FormHelperText>
        {jobTypeCheckboxes.map(({ label, prop }) => (
          <FormControlLabel
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
            slotProps={slotProps}
          />
        ))}
        <FormHelperText>Other Features</FormHelperText>
        <FormControlLabel
          control={
            <Checkbox
              onChange={({ target: { checked } }) =>
                dispatch(
                  setFilterBoolean({
                    key: "supportsOauth",
                    value: checked,
                  }),
                )
              }
            />
          }
          label={INSTITUTIONS_FILTER_OAUTH_LABEL_TEXT}
          slotProps={slotProps}
        />
        <Divider />
        <FormControlLabel
          className={styles.inactiveSwitch}
          control={
            <Switch
              onChange={({ target: { checked } }) =>
                dispatch(
                  setFilterBoolean({
                    key: "includeInactiveIntegrations",
                    value: checked,
                  }),
                )
              }
              size="small"
            />
          }
          label={INSTITUTIONS_FILTER_INCLUDE_INACTIVE_INTEGRATIONS_LABEL_TEXT}
          slotProps={slotProps}
        />
      </FormGroup>
    </div>
  );
};

export default InstitutionFilters;
