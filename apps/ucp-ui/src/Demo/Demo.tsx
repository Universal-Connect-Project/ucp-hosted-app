import React from "react";
import { useGetDemoTokenQuery } from "./api";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";
import PageContent from "../shared/components/PageContent";

import {
  WIDGET_DEMO_ERROR_MESSAGE,
  WIDGET_DEMO_IFRAME_TITLE,
} from "./constants";
import { Stack } from "@mui/material";
import FetchError from "../shared/components/FetchError";
import styles from "./demo.module.css";
import { ComboJobTypes } from "@repo/shared-utils";
import PhoneContainer from "./PhoneContainer";

const Demo = ({
  jobTypes,
  aggregator,
  onReset,
}: {
  jobTypes: (typeof ComboJobTypes)[keyof typeof ComboJobTypes][];
  aggregator: string;
  onReset: () => void;
}) => {
  const userId = React.useMemo(() => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }, []);

  const {
    data: tokenData,
    isError: tokenError,
    isLoading: tokenLoading,
    refetch,
  } = useGetDemoTokenQuery({
    userId,
  });

  const token = tokenData?.token;

  return (
    <PageContent>
      <Stack spacing={4}>
        <div className={styles.iframeContainer} data-testid="demo-component">
          {tokenError && (
            <FetchError
              description={WIDGET_DEMO_ERROR_MESSAGE}
              refetch={() => void refetch()}
            />
          )}

          <PhoneContainer
            src={`${WIDGET_DEMO_BASE_URL}/widget?jobTypes=${jobTypes.join(
              ",",
            )}&userId=${userId}&token=${token}&aggregatorOverride=${aggregator}`}
            title={WIDGET_DEMO_IFRAME_TITLE}
            onReset={onReset}
            isLoading={tokenLoading}
          />
        </div>
      </Stack>
    </PageContent>
  );
};

export default Demo;
