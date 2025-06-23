import React from "react";
import { useGetDemoTokenQuery } from "./api";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";
import PageContent from "../shared/components/PageContent";
import PageTitle from "../shared/components/PageTitle";
import { DEMO_PAGE_TITLE } from "./constants";
import { Stack } from "@mui/material";
import FetchError from "../shared/components/FetchError";
import styles from "./demo.module.css";

const Demo = () => {
  const userId = "some-user-id"; // Replace with actual user ID logic

  const {
    data: tokenData,
    isError: tokenError,
    refetch,
  } = useGetDemoTokenQuery({
    userId: userId as string,
  });

  const token = tokenData?.token;

  // const {
  //   data: htmlContent,
  //   isError: htmlError,
  //   isSuccess: htmlSuccess,
  //   refetch,
  // } = useGetDemoURLQuery(
  //   {
  //     token: token as string,
  //     jobTypes: "transactionHistory",
  //     userId: userId,
  //   },
  //   {
  //     skip: !token,
  //   },
  // );
  // const htmlContentString = htmlContent?.html.toString() || "";
  // let finalHtmlForIframe = htmlContentString;
  // if (htmlContent) {
  //   // Find the closing </head> tag and insert the <base> tag just before it
  //   const headEndIndex = htmlContentString.indexOf("/asset");
  //   if (headEndIndex !== -1) {
  //     finalHtmlForIframe =
  //       htmlContentString.substring(0, headEndIndex) +
  //       `${WIDGET_DEMO_BASE_URL}` + // Add the base tag
  //       htmlContentString.substring(headEndIndex);
  //   } else {
  //     // Fallback if no <head> tag (less ideal) - try to insert at beginning of html or body
  //     console.warn(
  //       "No </head> tag found in iframe HTML, base tag might not work as expected.",
  //     );
  //     finalHtmlForIframe = `${WIDGET_DEMO_BASE_URL}` + htmlContentString;
  //   }
  // }

  if (tokenError) {
    return (
      <FetchError
        description="Failed to load demo widget."
        refetch={() => void refetch()}
      />
    );
  }

  return (
    <PageContent shouldDisableVerticalOverflow>
      <Stack spacing={4}>
        <PageTitle>{DEMO_PAGE_TITLE}</PageTitle>

        <iframe
          className={styles.iframe}
          src={`${WIDGET_DEMO_BASE_URL}/widget?jobTypes=transactionHistory&userId=${userId}&token=${token}`}
          // src={
          //   "https://widgets.sand.internal.mx/md/connect/ZmUyMzBmZjIwOTM1ZGFhNjNhOTg5YTRmMWZkYmU5OWYwODMxMjZkNTVhNmExYzcyMTkzODg0ZmI4NzUwZmJkMzI5ZjllNWEyYzdlMTY4YzU2N2YzYTI1MzJhNWIzNGU3ZTM5Yzk1MGUyMTdlNzQxNWE5NDRlMTMwZmM5OWM1MWFhMjk3MmM5MmFjMDdjZjA0OTU5ZjQ4NDMxMzI2OGQwNHxVU1ItM2VkZTJiMDAtNThjYi00MzQxLTg2YmItNmRjODk4ZGQzMTI2/eyJ1aV9tZXNzYWdlX3ZlcnNpb24iOjQsInVpX21lc3NhZ2Vfd2Vidmlld191cmxfc2NoZW1lIjoibXgiLCJkYXRhX3JlcXVlc3QiOnsicHJvZHVjdHMiOlsiaWRlbnRpdHlfdmVyaWZpY2F0aW9uIiwidHJhbnNhY3Rpb25zIl19LCJ4X2NhbGxiYWNrX3BheWxvYWQiOiJZWE5vTFhSbGMzUT0iLCJsb2NhbGUiOiJlbiIsInNpZ25hdHVyZSI6ImZmNTVlYThkYjBhMGJkMDllZjY5NjYwZDZlZTUyYzUzMDM3NzQ5OTYwYTNjMmMzYTQ2OGQ4ODRkZTkzNzYwYjUifQ%3D%3D"
          // }
          title="Demo Widget"
        />
      </Stack>
    </PageContent>
  );
};

export default Demo;
