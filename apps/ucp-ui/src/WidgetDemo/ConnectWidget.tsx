import React from "react";
import { useGetDemoTokenQuery } from "./api";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";
import { RESET_BUTTON_TEXT } from "./constants";
import {
  WIDGET_DEMO_ERROR_MESSAGE,
  WIDGET_DEMO_IFRAME_TITLE,
} from "./constants";
import { Button, Stack } from "@mui/material";
import FetchError from "../shared/components/FetchError";
import styles from "./connectWidget.module.css";
import { ComboJobTypes } from "@repo/shared-utils";
import PhoneContainer from "./PhoneContainer";

const ConnectWidget = ({
  jobTypes,
  aggregator,
  onReset,
}: {
  jobTypes: (typeof ComboJobTypes)[keyof typeof ComboJobTypes][];
  aggregator: string;
  onReset: () => void;
}) => {
  const userId = "some-user-id"; // Replace with actual user ID logic

  const {
    data: tokenData,
    isError: tokenError,
    isLoading: tokenLoading,
    refetch,
  } = useGetDemoTokenQuery({
    userId: userId as string,
  });

  const token = tokenData?.token;
  const targetOrigin = window.location.origin;

  return (
    <Stack spacing={4}>
      <div className={styles.iframeContainer} data-testid="demo-component">
        <PhoneContainer isLoading={tokenLoading}>
          {tokenError ? (
            <div className={`${styles.errorContent} ${styles.phoneContainer}`}>
              <FetchError
                description={WIDGET_DEMO_ERROR_MESSAGE}
                refetch={() => void refetch()}
              />
            </div>
          ) : (
            <iframe
              className={styles.phoneContainer}
              src={`${WIDGET_DEMO_BASE_URL}/widget?jobTypes=${jobTypes.join(
                ",",
              )}&userId=${userId}&token=${token}&aggregatorOverride=${aggregator}&targetOrigin=${targetOrigin}`}
              title={WIDGET_DEMO_IFRAME_TITLE}
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            />
          )}
        </PhoneContainer>
      </div>
      <div className={styles.buttonContainer}>
        <Button color="primary" variant="text" onClick={onReset}>
          {RESET_BUTTON_TEXT}
        </Button>
      </div>
    </Stack>
  );
};

export default ConnectWidget;
