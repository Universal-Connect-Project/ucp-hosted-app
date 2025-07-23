import React, { useEffect, useRef } from "react";
import { useGetDemoTokenQuery } from "./api";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";
import PageContent from "../shared/components/PageContent";
import {
  AGGREGATORS,
  INSTITUTION_SELECTED,
  MEMBER_CONNECTED,
} from "./constants";
import { useAppDispatch } from "../shared/utils/redux";
import { addConnection, Connection } from "../shared/reducers/demo";
import {
  WIDGET_DEMO_ERROR_MESSAGE,
  WIDGET_DEMO_IFRAME_TITLE,
} from "./constants";
import { Stack } from "@mui/material";
import FetchError from "../shared/components/FetchError";
import styles from "./connect.module.css";
import { ComboJobTypes } from "@repo/shared-utils";
import PhoneContainer from "./PhoneContainer";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";

interface IframeMessage {
  type: string;
  metadata?: {
    name?: string;
    [key: string]: unknown;
  };
}

const Connect = ({
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

  // POST MESSAGE HANDLER
  const dispatch = useAppDispatch();
  const jobTypeDisplayNames = jobTypes.map(
    (jobType) => supportsJobTypeMap[jobType].displayName,
  );
  const aggregatorDisplayName =
    AGGREGATORS.find((agg) => agg.value === aggregator)?.label || aggregator;
  const institutionNameRef = useRef("");

  useEffect(() => {
    const handleMessage = (event: MessageEvent<IframeMessage>) => {
      if (event.origin !== WIDGET_DEMO_BASE_URL) {
        return;
      }

      const { type, metadata } = event.data;
      if (type === INSTITUTION_SELECTED) {
        institutionNameRef.current = metadata?.name || "";
      }

      if (type === MEMBER_CONNECTED) {
        const newConnection: Connection = {
          aggregator: aggregatorDisplayName,
          jobTypes: jobTypeDisplayNames,
          institution: institutionNameRef.current,
        };
        dispatch(addConnection(newConnection));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  });

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
            )}&userId=${userId}&token=${token}&aggregatorOverride=${aggregator}&targetOrigin=${targetOrigin}`}
            title={WIDGET_DEMO_IFRAME_TITLE}
            onReset={onReset}
            isLoading={tokenLoading}
          />
        </div>
      </Stack>
    </PageContent>
  );
};

export default Connect;
