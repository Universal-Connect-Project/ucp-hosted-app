import React from "react";
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
} from "@mui/material";
import PageContent from "../shared/components/PageContent";
import PageTitle from "../shared/components/PageTitle";
import {
  WIDGET_DEMO_PAGE_TITLE,
  CONNECT_TAB,
  CONNECTIONS_TAB,
} from "./constants";
import styles from "./demoLandingPage.module.css";
const DemoLandingPage = () => {
  const [aggregator, setAggregator] = React.useState("MX");
  const handleChange = (event: SelectChangeEvent) => {
    setAggregator(event.target.value);
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
              <FormGroup className={styles.formGroup}>
                <FormLabel>
                  <p className={styles.paragraph} style={{ display: "inline" }}>
                    {"Job type "}
                  </p>
                  <span style={{ color: "#e32727", fontSize: "15px" }}>*</span>
                </FormLabel>
                <FormControlLabel
                  control={<Checkbox size="small" defaultChecked />}
                  label="Account Number"
                />
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="Account Owner"
                />
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="Transactions"
                />
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="Transaction History"
                />
              </FormGroup>
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
                >
                  Submit
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
