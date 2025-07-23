import React, { useCallback, useEffect, useState } from "react";
import { Tabs, Tab, Box, Stack } from "@mui/material";
import {
  CONNECT_TAB,
  CONNECTIONS_TAB,
  MEMBER_CONNECTED,
  INSTITUTION_SELECTED,
  WIDGET_DEMO_PAGE_TITLE,
} from "./constants";
import Connections from "./Connections";
import PageTitle from "../shared/components/PageTitle";
import ConnectConfiguration from "./ConnectConfiguration";
import PageContent from "../shared/components/PageContent";
import { useAppDispatch } from "../shared/utils/redux";
import { addConnection } from "../shared/reducers/demo";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";

interface IframeMessage {
  type: string;
  metadata?: {
    guid?: string;
    name?: string;
    ucpInstitutionId?: string;
    [key: string]: unknown;
  };
}

const WidgetDemo: React.FC = () => {
  const dispatch = useAppDispatch();
  const [connectionGuid, setConnectionGuid] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState("");
  const handleMessage = useCallback(
    (event: MessageEvent<IframeMessage>) => {
      if (event.origin !== WIDGET_DEMO_BASE_URL) {
        return;
      }

      const { type, metadata } = event.data;

      if (type === INSTITUTION_SELECTED && metadata?.guid) {
        setConnectionGuid(metadata.guid);
        setInstitutionName(metadata.name || "");
      }

      if (
        type === MEMBER_CONNECTED &&
        metadata?.ucpInstitutionId &&
        metadata.ucpInstitutionId === connectionGuid
      ) {
        dispatch(addConnection(institutionName));
        setConnectionGuid(null);
      }
    },
    [dispatch, connectionGuid, institutionName],
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);

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
