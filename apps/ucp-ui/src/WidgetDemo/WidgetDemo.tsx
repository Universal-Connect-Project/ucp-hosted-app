import React from "react";
import { Tabs, Tab, Box, Stack } from "@mui/material";
import {
  CONNECT_TAB,
  CONNECTIONS_TAB,
  WIDGET_DEMO_PAGE_TITLE,
} from "./constants";
import Connections from "./Connections";
import PageTitle from "../shared/components/PageTitle";
import ConnectConfiguration from "./ConnectConfiguration";
import PageContent from "../shared/components/PageContent";

const WidgetDemo: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
        {tabValue === 0 && <ConnectConfiguration />}
        {tabValue === 1 && <Connections />}
      </Stack>
    </PageContent>
  );
};

export default WidgetDemo;
