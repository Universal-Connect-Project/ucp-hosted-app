import React from "react";
import { useCreateWidgetUrlQuery } from "./api";
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
import { v4 as uuidv4 } from "uuid";

const ConnectWidget = ({
  jobTypes,
  aggregator,
  onReset,
}: {
  jobTypes: (typeof ComboJobTypes)[keyof typeof ComboJobTypes][];
  aggregator: string;
  onReset: () => void;
}) => {
  const userId = React.useMemo(() => {
    return uuidv4();
  }, []);

  const targetOrigin = window.location.origin;

  const {
    data: widgetData,
    isError: widgetError,
    isLoading: widgetLoading,
    refetch,
  } = useCreateWidgetUrlQuery({
    jobTypes,
    userId,
    targetOrigin,
    aggregatorOverride: aggregator,
  });

  const widgetUrl = widgetData?.widgetUrl;

  return (
    <Stack spacing={4}>
      <div className={styles.iframeContainer} data-testid="demo-component">
        <PhoneContainer isLoading={widgetLoading}>
          {widgetError ? (
            <div className={`${styles.errorContent} ${styles.phoneContainer}`}>
              <FetchError
                description={WIDGET_DEMO_ERROR_MESSAGE}
                refetch={() => void refetch()}
              />
            </div>
          ) : (
            widgetUrl && (
              <iframe
                className={styles.phoneContainer}
                src={widgetUrl}
                title={WIDGET_DEMO_IFRAME_TITLE}
                allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
              />
            )
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
