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
} from "@mui/material";
import PageContent from "../shared/components/PageContent";
import PageTitle from "../shared/components/PageTitle";
import {
  WIDGET_DEMO_PAGE_TITLE,
  CONNECT_TAB,
  CONNECTIONS_TAB,
} from "./constants";
import styles from "./demoLandingPage.module.css";
import Demo from "./Demo";
import Connections from "./Connections";
import { RequiredHeader } from "../shared/components/requiredHeader";
import { useForm, Controller } from "react-hook-form";

type FormValues = {
  accountNumber: boolean;
  accountOwner: boolean;
  transactions: boolean;
  transactionHistory: boolean;
  aggregator: string;
};

const DemoLandingPage = () => {
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const {
    handleSubmit,
    control,
    formState: { isSubmitted, errors },
    getValues,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      accountNumber: true,
      accountOwner: false,
      transactions: false,
      transactionHistory: false,
      aggregator: "MX",
    },
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
    setJobTypes(newJobTypes);
  };

  const handleReset = () => {
    setJobTypes([]);
    reset();
  };

  const aggregator = getValues("aggregator");
  const error =
    Object.values(errors).length > 0 &&
    !Object.values(getValues())
      .slice(0, 4)
      .some((v) => v);

  return (
    <PageContent>
      <Stack spacing={4}>
        <PageTitle>{WIDGET_DEMO_PAGE_TITLE}</PageTitle>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={CONNECT_TAB} />
            <Tab label={CONNECTIONS_TAB} />
          </Tabs>
        </Box>
        {tabValue === 0 &&
          (isSubmitted && jobTypes.length > 0 ? (
            <Demo
              JobTypes={jobTypes}
              aggregator={aggregator.toLowerCase()}
              onReset={handleReset}
            />
          ) : (
            <Paper className={styles.paper}>
              <Stack spacing={2} sx={{ padding: 2 }}>
                <Box>
                  <form
                    id="demo-form"
                    onSubmit={(e) => void handleSubmit(handleOnSubmit)(e)}
                  >
                    <h3 className={styles.title}>Configuration</h3>
                    <FormControl required className={styles.formControl}>
                      <div className={styles.formLabel}>
                        <RequiredHeader
                          title={"Job type*"}
                          error={error}
                          errorMessage={"*Please select at least one job type."}
                        />
                      </div>
                      <Controller
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
                      />
                      <Controller
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
                      />
                    </FormControl>

                    <FormGroup className={styles.formGroup}>
                      <Controller
                        name="aggregator"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            fullWidth
                            select
                            label="Aggregator"
                            {...field}
                          >
                            <MenuItem className={styles.menuItem} value={"MX"}>
                              {"MX"}
                            </MenuItem>
                            <MenuItem
                              className={styles.menuItem}
                              value={"Sophtron"}
                            >
                              {"Sophtron"}
                            </MenuItem>
                          </TextField>
                        )}
                      />
                    </FormGroup>
                    <Box className={styles.buttonContainer}>
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
        {tabValue === 1 && <Connections />}
      </Stack>
    </PageContent>
  );
};

export default DemoLandingPage;
