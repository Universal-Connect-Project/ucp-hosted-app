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
import { useForm, Controller } from "react-hook-form";

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
    handleSubmit,
    control,
    formState: { isSubmitted, errors },
    getValues,
    reset,
  } = useForm<FormValues>({
    defaultValues,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOnSubmit = (data: FormValues) => {
    const newJobTypes = Object.entries(data)
      .filter(([key, value]) => key !== "aggregator" && value)
      .map(([key]) => key);

    if (newJobTypes.length === 0) {
      return;
    }
  };

  const handleReset = () => {
    reset();
  };

  const aggregator = getValues("aggregator");
  const jobTypes = Object.entries(getValues())
    .filter(([key, value]) => key !== "aggregator" && value)
    .map(([key]) => key);

  const error = isSubmitted && Object.keys(errors).length > 0;

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
          (isSubmitted && jobTypes.length > 0 ? (
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
                    onSubmit={(e) => void handleSubmit(handleOnSubmit)(e)}
                  >
                    <Stack sx={{ my: 4 }}>
                      <Typography variant="h5" fontWeight={700}>
                        Configuration
                      </Typography>
                    </Stack>

                    <FormControl required>
                      <RequiredCheckboxGroupHeader
                        title={"Job type"}
                        error={error}
                        errorMessage={"Please select at least one job type."}
                      />

                      {checkboxes.map((checkbox) => (
                        <Controller
                          key={checkbox.name}
                          name={checkbox.name}
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  checked={field.value as boolean}
                                  onChange={field.onChange}
                                  name={field.name}
                                />
                              }
                              label={checkbox.label}
                            />
                          )}
                        />
                      ))}

                      {/* <Controller
                        name="accountNumber"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={field.value}
                                onChange={field.onChange}
                                name={field.name}
                              />
                            }
                            label="Account Number"
                          />
                        )}
                      />
                      <Controller
                        name="accountOwner"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value}
                                size="small"
                                onChange={field.onChange}
                                name={field.name}
                              />
                            }
                            label="Account Owner"
                          />
                        )}
                      />
                      <Controller
                        name="transactions"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value}
                                size="small"
                                onChange={field.onChange}
                                name={field.name}
                              />
                            }
                            label="Transactions"
                          />
                        )}
                      /> */}
                      {/* <Controller
                        name="transactionHistory"
                        control={control}
                        rules={{
                          validate: () => {
                            const {
                              accountNumber,
                              accountOwner,
                              transactions,
                              transactionHistory,
                            } = getValues();
                            return (
                              accountNumber ||
                              accountOwner ||
                              transactions ||
                              transactionHistory ||
                              false
                            );
                          },
                        }}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value}
                                size="small"
                                onChange={field.onChange}
                                name={field.name}
                              />
                            }
                            label="Transaction History"
                          />
                        )}
                      /> */}
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
