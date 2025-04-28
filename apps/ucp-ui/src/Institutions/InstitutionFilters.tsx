import React, { ChangeEvent } from "react";
import styles from "./institutionFilters.module.css";
import TextField from "../shared/components/Forms/TextField";
import { Search } from "@mui/icons-material";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";
import {
  Alert,
  AlertTitle,
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
  INSTITUTIONS_FILTER_AGGREGATORS_ERROR_TEXT,
  INSTITUTIONS_FILTER_INCLUDE_INACTIVE_INTEGRATIONS_LABEL_TEXT,
  INSTITUTIONS_FILTER_OAUTH_LABEL_TEXT,
  INSTITUTIONS_FILTER_SEARCH_LABEL_TEXT,
} from "./constants";
import { InstitutionParamsBooleans, InstitutionsParams } from "./api";
import LoadingCheckbox from "./LoadingCheckbox";

export const jobTypeCheckboxes = [
  {
    label: supportsJobTypeMap.transactions.displayName,
    prop: "supportsAggregation",
  },
  {
    label: supportsJobTypeMap.accountOwner.displayName,
    prop: "supportsIdentification",
  },
  {
    label: supportsJobTypeMap.accountNumber.displayName,
    prop: "supportsVerification",
  },
  {
    label: supportsJobTypeMap.transactionHistory.displayName,
    prop: "supportsHistory",
  },
  {
    label: supportsJobTypeMap.rewards.displayName,
    prop: "supportsRewards",
  },
  {
    label: supportsJobTypeMap.balance.displayName,
    prop: "supportsBalance",
  },
];

const InstitutionFilters = ({
  handleChangeParams,
  institutionsParams,
}: {
  handleChangeParams: (changes: Record<string, string>) => void;
  institutionsParams: InstitutionsParams;
}) => {
  const {
    data: aggregatorsData,
    isError: isAggregatorsError,
    isLoading: isAggregatorsLoading,
  } = useGetAggregatorsQuery();

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
        onChange={({ target: { value } }) => {
          handleChangeParams({
            search: value,
          });
        }}
        value={institutionsParams.search}
      />
      <FormGroup className={styles.formGroup}>
        <FormHelperText>Aggregator</FormHelperText>
        {isAggregatorsError && (
          <Alert icon={false} severity="error">
            <AlertTitle>Filter not found</AlertTitle>
            {INSTITUTIONS_FILTER_AGGREGATORS_ERROR_TEXT}
          </Alert>
        )}
        {isAggregatorsLoading && (
          <>
            <LoadingCheckbox />
            <LoadingCheckbox />
          </>
        )}
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
