import React from "react";
import { useGetDemoTokenQuery } from "./api";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";
import PageContent from "../shared/components/PageContent";
import PageTitle from "../shared/components/PageTitle";
import {
  WIDGET_DEMO_ERROR_MESSAGE,
  WIDGET_DEMO_PAGE_TITLE,
  WIDGET_DEMO_IFRAME_TITLE,
} from "./constants";
import { Stack } from "@mui/material";
import FetchError from "../shared/components/FetchError";
import styles from "./demo.module.css";
import { SkeletonIfLoading } from "../shared/components/Skeleton";
import { ComboJobTypes } from "@repo/shared-utils";
import PhoneContainer from "./PhoneContainer";

const Demo = ({
  JobTypes,
  aggregator,
  onReset,
}: {
  JobTypes: (typeof ComboJobTypes)[keyof typeof ComboJobTypes][];
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

  if (tokenError) {
    return (
      <FetchError
        description={WIDGET_DEMO_ERROR_MESSAGE}
        refetch={() => void refetch()}
      />
    );
  }

  return (
    <PageContent>
      <Stack spacing={4}>
        <PageTitle>{WIDGET_DEMO_PAGE_TITLE}</PageTitle>
        <div className={styles.iframeContainer}>
          <SkeletonIfLoading isLoading={tokenLoading}>
            <PhoneContainer
              src={`${WIDGET_DEMO_BASE_URL}/widget?jobTypes=${JobTypes.join(
                ",",
              )}&userId=${userId}&token=${token}&aggregatorOverride=${aggregator}`}
              title={WIDGET_DEMO_IFRAME_TITLE}
              onReset={onReset}
            />
          </SkeletonIfLoading>
        </div>
      </Stack>
    </PageContent>
  );
};

export default Demo;
