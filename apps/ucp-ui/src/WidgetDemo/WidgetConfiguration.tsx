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
  checkboxes,
  FormValues,
} from "./constants";
import styles from "./widgetConfiguration.module.css";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormTrigger,
} from "react-hook-form";

import { RequiredCheckboxGroupHeader } from "../shared/components/RequiredCheckboxGroupHeader";

interface WidgetConfigurationProps {
  control: Control<FormValues, undefined>;
  trigger: UseFormTrigger<FormValues>;
  errors: FieldErrors<FormValues>;
  onSubmit: () => Promise<void> | void;
  aggregators: { value: string; label: string }[] | undefined;
}

const formId = "demoForm";

const WidgetConfiguration: React.FC<WidgetConfigurationProps> = ({
  control,
  trigger,
  errors,
  onSubmit,
  aggregators,
}) => {
  const isJobTypeError = checkboxes.some(({ name }) => errors[name]);

  const triggerJobTypesValidation = () =>
    trigger(checkboxes.map(({ name }) => name));

  const validateAnyJobTypeSelected = (
    _value: string | boolean,
    formValues: FormValues,
  ): boolean => checkboxes.some(({ name }) => formValues[name]);

  return (
    <Paper className={styles.paper}>
      <Stack
        component="form"
        id={formId}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={onSubmit}
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
                  select={!!aggregators?.length}
                  label="Aggregator"
                  {...field}
                >
                  {aggregators?.map((aggregator) => (
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
