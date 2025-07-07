import React, { useState } from "react";
import {
  Stack,
  Tabs,
  Tab,
  Box,
  Paper,
  FormGroup,
  FormLabel,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  FormControl,
  FormHelperText,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import PageContent from "../shared/components/PageContent";
import PageTitle from "../shared/components/PageTitle";
import {
  WIDGET_DEMO_PAGE_TITLE,
  CONNECT_TAB,
  CONNECTIONS_TAB,
} from "./constants";
import styles from "./demoLandingPage.module.css";
const DemoLandingPage = () => {
  const [aggregator, setAggregator] = useState("MX");
  const [checkboxState, setCheckboxState] = useState({
    accountNumber: true,
    accountOwner: false,
    transactions: false,
    transactionHistory: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (event: SelectChangeEvent) => {
    setAggregator(event.target.value);
  };
  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxState({
      ...checkboxState,
      [event.target.name]: event.target.checked,
    });
  };

  const { accountNumber, accountOwner, transactions, transactionHistory } =
    checkboxState;
  const error =
    [accountNumber, accountOwner, transactions, transactionHistory].filter(
      (v) => v,
    ).length < 1;

  const handleOnSubmit = () => {
    setIsSubmitted(true);
    if (error) {
      return false;
    }
    // Handle form submission logic here
    console.log("Form submitted with selected option:", checkboxState);
  };

  return (
    <PageContent>
      <Stack spacing={4}>
        <PageTitle>{WIDGET_DEMO_PAGE_TITLE}</PageTitle>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={0}>
            <Tab label={CONNECT_TAB} />
            <Tab label={CONNECTIONS_TAB} />
          </Tabs>
        </Box>
        <Paper className={styles.paper}>
          <Stack spacing={2} sx={{ padding: 2 }}>
            <Box>
              <h3 className={styles.title}>Configuration</h3>
              <FormControl required className={styles.formControl}>
                <FormLabel className={styles.formLabel}>
                  <p className={styles.paragraph} style={{ display: "inline" }}>
                    {"Job type "}
                  </p>
                </FormLabel>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={accountNumber}
                      onChange={handleCheck}
                      name="accountNumber"
                    />
                  }
                  label="Account Number"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={accountOwner}
                      size="small"
                      onChange={handleCheck}
                      name="accountOwner"
                    />
                  }
                  label="Account Owner"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={transactions}
                      size="small"
                      onChange={handleCheck}
                      name="transactions"
                    />
                  }
                  label="Transactions"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={transactionHistory}
                      size="small"
                      onChange={handleCheck}
                      name="transactionHistory"
                    />
                  }
                  label="Transaction History"
                />
                {isSubmitted && error && (
                  <FormHelperText role="alert" className={styles.errorText}>
                    <ErrorIcon className={styles.errorIcon} />
                    {"Please select at least one job type."}
                  </FormHelperText>
                )}
              </FormControl>

              <FormGroup className={styles.formGroup}>
                <FormLabel>
                  <p className={styles.paragraph} style={{ display: "inline" }}>
                    {"Aggregator"}
                  </p>
                </FormLabel>
                <Select
                  className={styles.select}
                  value={aggregator}
                  onChange={handleChange}
                  label="Aggregator"
                >
                  <MenuItem className={styles.menuItem} value={"MX"}>
                    {"MX"}
                  </MenuItem>
                  <MenuItem className={styles.menuItem} value={"Sophtron"}>
                    {"Sophtron"}
                  </MenuItem>
                </Select>
              </FormGroup>
              <Box className={styles.buttonContainer}>
                <span style={{ color: "#e32727", fontSize: "13px" }}>*</span>
                <p
                  className={styles.requiredText}
                  style={{ display: "inline" }}
                >
                  {" Required"}
                </p>

                <Button
                  className={styles.button}
                  variant="contained"
                  color="primary"
                  onClick={handleOnSubmit}
                >
                  Launch
                </Button>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </PageContent>
  );
};

export default DemoLandingPage;
