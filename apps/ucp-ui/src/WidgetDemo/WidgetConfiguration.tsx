import React from "react";
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
import styles from "./widgetConfiguration.module.css";
import { Control, Controller } from "react-hook-form";

import { RequiredCheckboxGroupHeader } from "../shared/components/RequiredCheckboxGroupHeader";
import { allJobTypes, supportsJobTypeMap } from "../shared/constants/jobTypes";

export interface FormValues {
  accountNumber: boolean;
  accountOwner: boolean;
  transactions: boolean;
  transactionHistory: boolean;
  aggregator: string;
}
interface WidgetConfigurationProps {
  control: Control<FormValues, undefined>;
  isJobTypeError: boolean;
  triggerJobTypesValidation: () => Promise<boolean>;
  validateAnyJobTypeSelected: (
    _value: string | boolean,
    formValues: FormValues,
  ) => boolean;
  onSubmit: () => Promise<void> | void;
}
interface JobTypeCheckbox {
  defaultValue?: boolean;
  name: keyof FormValues;
  label: string;
}

const formId = "demoForm";

const WidgetConfiguration: React.FC<WidgetConfigurationProps> = ({
  control,
  isJobTypeError,
  triggerJobTypesValidation,
  validateAnyJobTypeSelected,
  onSubmit,
}) => {
  const checkboxes: JobTypeCheckbox[] = allJobTypes.map((jobType) => ({
    name: jobType as keyof FormValues,
    label: supportsJobTypeMap[jobType].displayName,
    defaultValue: jobType === "accountNumber",
  }));
  return (
    <Paper className={styles.paper}>
      <Stack
        component="form"
        id={formId}
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
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

export default WidgetConfiguration;
