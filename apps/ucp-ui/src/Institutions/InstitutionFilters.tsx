import React, { ChangeEvent, useMemo } from "react";
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
import {
  INSTITUTIONS_FILTER_INCLUDE_INACTIVE_INTEGRATIONS_LABEL_TEXT,
  INSTITUTIONS_FILTER_OAUTH_LABEL_TEXT,
  INSTITUTIONS_FILTER_SEARCH_LABEL_TEXT,
} from "./constants";
import { InstitutionParamsBooleans, InstitutionsParams } from "./api";

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

const InstitutionFilters = ({
  handleChangeParams,
  institutionsParams,
}: {
  handleChangeParams: (changes: Record<string, string>) => void;
  institutionsParams: InstitutionsParams;
}) => {
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce(
        ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
          handleChangeParams({
            search: value,
          }),
        250,
      ),
    [handleChangeParams],
  );

  const { data: aggregatorsData } = useGetAggregatorsQuery();

  const slotProps = {
    typography: {
      variant: "body2",
    } as TypographyProps,
  };

  const createChangeAggregatorHandler =
    (name: string) =>
    ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => {
      const { aggregatorName } = institutionsParams;

      let newAggregatorName = [...aggregatorName];

      if (checked) {
        newAggregatorName.push(name);
      } else {
        newAggregatorName = aggregatorName.filter(
          (current) => current !== name,
        );
      }

      handleChangeParams({
        aggregatorName: newAggregatorName.toString(),
      });
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
                checked={institutionsParams.aggregatorName?.includes(name)}
                onChange={createChangeAggregatorHandler(name)}
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
                checked={
                  institutionsParams[prop as keyof InstitutionParamsBooleans]
                }
                onChange={({ target: { checked } }) => {
                  handleChangeParams({
                    [prop]: checked.toString(),
                  });
                }}
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
              checked={institutionsParams.supportsOauth}
              onChange={({ target: { checked } }) =>
                handleChangeParams({
                  supportsOauth: checked.toString(),
                })
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
              checked={institutionsParams.includeInactiveIntegrations}
              onChange={({ target: { checked } }) =>
                handleChangeParams({
                  includeInactiveIntegrations: checked.toString(),
                })
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
