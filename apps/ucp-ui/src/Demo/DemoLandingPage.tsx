import React, { useState } from "react";
import {
  Stack,
  Tabs,
  Tab,
  Box,
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
import PageContent from "../shared/components/PageContent";
import PageTitle from "../shared/components/PageTitle";
import { WIDGET_DEMO_PAGE_TITLE, CONNECT_TAB } from "./constants";
import styles from "./demoLandingPage.module.css";
import Demo from "./Demo";
import { RequiredCheckboxGroupHeader } from "../shared/components/RequiredCheckboxGroupHeader";
import { useForm, Controller, SubmitHandler } from "react-hook-form";

interface FormValues {
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

const DemoLandingPage = () => {
  const [submittedValues, setSubmittedValues] = useState<FormValues | null>(
    null,
  );

  const [tabValue, setTabValue] = useState(0);
  const checkboxes: JobTypeCheckbox[] = [
    { defaultValue: true, name: "accountNumber", label: "Account Number" },
    { name: "accountOwner", label: "Account Owner" },
    { name: "transactions", label: "Transactions" },
    { name: "transactionHistory", label: "Transaction History" },
  ];

  const defaultValues = checkboxes.reduce(
    (acc, { defaultValue, name }) => ({
      ...acc,
      [name]: !!defaultValue,
    }),
    {
      aggregator: "MX",
    },
  );

  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
    trigger,
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onSubmit: SubmitHandler<FormValues> = setSubmittedValues;

  const handleReset = () => {
    reset();
    setSubmittedValues(null);
  };

  const aggregator = getValues("aggregator");
  const jobTypes = Object.entries(submittedValues || {})
    .filter(([key, value]) => key !== "aggregator" && value)
    .map(([key]) => key);

  return (
    <PageContent>
      <Stack spacing={4}>
        <PageTitle>{WIDGET_DEMO_PAGE_TITLE}</PageTitle>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={CONNECT_TAB} />
          </Tabs>
        </Box>
        {tabValue === 0 &&
          (submittedValues ? (
            <Demo
              jobTypes={jobTypes}
              aggregator={aggregator.toLowerCase()}
              onReset={handleReset}
            />
          ) : (
            <Paper className={styles.paper}>
              <Stack spacing={2} sx={{ padding: 2 }}>
                <Box>
                  <form
                    className={styles.margins}
                    id="demo-form"
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <Stack sx={{ my: 4 }}>
                      <Typography variant="h5" fontWeight={700}>
                        Configuration
                      </Typography>
                    </Stack>

                    <FormControl required>
                      <RequiredCheckboxGroupHeader
                        title={"Job type"}
                        error={isJobTypeError}
                        errorMessage={"Please select at least one job type."}
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
                    <Stack sx={{ my: 4 }}>
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
                              <MenuItem value={"MX"}>{"MX"}</MenuItem>
                              <MenuItem value={"Sophtron"}>
                                {"Sophtron"}
                              </MenuItem>
                            </TextField>
                          )}
                        />
                      </FormGroup>
                    </Stack>
                    <Box>
                      <Button
                        className={styles.button}
                        variant="contained"
                        color="primary"
                        type="submit"
                        form="demo-form"
                      >
                        Launch
                      </Button>
                    </Box>
                  </form>
                </Box>
              </Stack>
            </Paper>
          ))}
      </Stack>
    </PageContent>
  );
};

export default DemoLandingPage;
