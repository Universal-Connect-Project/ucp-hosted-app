import React from "react";
import { useGetDemoTokenQuery } from "./api";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";
import PageContent from "../shared/components/PageContent";
import PageTitle from "../shared/components/PageTitle";
import { WIDGET_DEMO_PAGE_TITLE } from "./constants";
import { Stack } from "@mui/material";
import FetchError from "../shared/components/FetchError";
import styles from "./demo.module.css";

const Demo = () => {
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
        description="Failed to load demo widget."
        refetch={() => void refetch()}
      />
    );
  }

  return (
    <PageContent>
      <Stack spacing={4}>
        <PageTitle>{WIDGET_DEMO_PAGE_TITLE}</PageTitle>
        {tokenLoading ? (
          <div className={styles.loading}>Loading demo widget...</div>
        ) : (
          <div className={styles.iframeContainer}>
            {token ? (
              <iframe
                className={styles.iframe}
                src={`${WIDGET_DEMO_BASE_URL}/widget?jobTypes=transactionHistory&userId=${userId}&token=${token}`}
                title="Demo Widget"
              />
            ) : null}
          </div>
        )}
      </Stack>
    </PageContent>
  );
};

export default Demo;
