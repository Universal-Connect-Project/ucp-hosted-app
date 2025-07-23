import React, { useState } from "react";
import {
  Stack,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Button,
  FormControl,
  TextField,
  Typography,
} from "@mui/material";
import {
  LAUNCH_BUTTON_TEXT,
  CONFIGURATION_HEADER,
  JOB_TYPE_ERROR_MESSAGE,
  AGGREGATORS,
} from "./constants";
import styles from "./connectConfiguration.module.css";
import Connect from "./Connect";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { allJobTypes, supportsJobTypeMap } from "../shared/constants/jobTypes";
import { RequiredCheckboxGroupHeader } from "../shared/components/RequiredCheckboxGroupHeader";

export interface FormValues {
  accountNumber: boolean;
  accountOwner: boolean;
  transactions: boolean;
  transactionHistory: boolean;
  aggregator: string;
}

interface JobTypeCheckbox {
  defaultValue?: boolean;
  name: keyof FormValues;
  label: string;
}

const formId = "demoForm";

const ConnectConfiguration = () => {
  const [submittedValues, setSubmittedValues] = useState<FormValues | null>(
    null,
  );

  const checkboxes: JobTypeCheckbox[] = allJobTypes.map((jobType) => ({
    name: jobType as keyof FormValues,
    label: supportsJobTypeMap[jobType].displayName,
    defaultValue: jobType === "accountNumber",
  }));

  const defaultValues = checkboxes.reduce(
    (acc, { defaultValue, name }) => ({
      ...acc,
      [name]: !!defaultValue,
    }),
    {
      aggregator: "mx",
    },
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    trigger,
    reset,
  } = useForm<FormValues>({
    defaultValues,
    mode: "onTouched",
  });

  const isJobTypeError = checkboxes.some(({ name }) => errors[name]);

  const triggerJobTypesValidation = () =>
    trigger(checkboxes.map(({ name }) => name));

  const validateAnyJobTypeSelected = (
    _value: string | boolean,
    formValues: FormValues,
  ): boolean => checkboxes.some(({ name }) => formValues[name]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setSubmittedValues(data);
  };

  const handleReset = () => {
    reset(defaultValues);
    setSubmittedValues(null);
  };

  if (submittedValues) {
    return (
      <Connect
        jobTypes={Object.entries(submittedValues)
          .filter(([key, value]) => key !== "aggregator" && value)
          .map(([key]) => key)}
        aggregator={submittedValues.aggregator}
        onReset={handleReset}
      />
    );
  }

  return (
    <Paper className={styles.paper}>
      <Stack
        component="form"
        id={formId}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
        spacing={5}
      >
        <Typography variant="h5" fontWeight={700}>
          {CONFIGURATION_HEADER}
        </Typography>

        <Stack spacing={4}>
          <FormControl required>
            <RequiredCheckboxGroupHeader
              title={"Job type"}
              error={isJobTypeError}
              errorMessage={JOB_TYPE_ERROR_MESSAGE}
            />

            {checkboxes.map((checkbox) => (
              <Controller
                key={checkbox.name}
                name={checkbox.name}
                control={control}
                render={({ field: { name, onChange, value } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={value as boolean}
                        onChange={(event) => {
                          onChange(event);

                          void triggerJobTypesValidation();
                        }}
                        name={name}
                      />
                    }
                    label={checkbox.label}
                  />
                )}
                rules={{ validate: validateAnyJobTypeSelected }}
              />
            ))}
          </FormControl>
          <FormGroup>
            <Controller
              name="aggregator"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  select
                  label="Aggregator"
                  data-testid="aggregator-select"
                  {...field}
                >
                  {AGGREGATORS.map((aggregator) => (
                    <MenuItem key={aggregator.value} value={aggregator.value}>
                      {aggregator.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </FormGroup>
        </Stack>
        <Button
          className={styles.button}
          variant="contained"
          color="primary"
          type="submit"
          form={formId}
        >
          {LAUNCH_BUTTON_TEXT}
        </Button>
      </Stack>
    </Paper>
  );
};

export default ConnectConfiguration;
