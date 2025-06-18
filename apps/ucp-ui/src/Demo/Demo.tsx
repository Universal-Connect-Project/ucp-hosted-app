import React from "react";
import { useGetDemoTokenQuery, useGetDemoURLQuery } from "./api";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";

const Demo = () => {
  const userId = "some-user-id"; // Replace with actual user ID logic

  const {
    data: tokenData,
    isLoading: tokenLoading,
    isError: tokenError,
  } = useGetDemoTokenQuery({ userId: userId as string });

  const token = tokenData?.token;

  const {
    data: htmlContent,
    isLoading: htmlLoading,
    isError: htmlError,
    isSuccess: htmlSuccess,
  } = useGetDemoURLQuery(
    {
      token: token as string,
      jobTypes: "transactionHistory",
      userId: userId,
    },
    {
      skip: !token,
    },
  );
  const htmlContentString = htmlContent?.html.toString() || "";
  let finalHtmlForIframe = htmlContentString;
  if (htmlContent) {
    // Find the closing </head> tag and insert the <base> tag just before it
    const headEndIndex = htmlContentString.indexOf("/asset");
    if (headEndIndex !== -1) {
      finalHtmlForIframe =
        htmlContentString.substring(0, headEndIndex) +
        `${WIDGET_DEMO_BASE_URL}` + // Add the base tag
        htmlContentString.substring(headEndIndex);
    } else {
      // Fallback if no <head> tag (less ideal) - try to insert at beginning of html or body
      console.warn(
        "No </head> tag found in iframe HTML, base tag might not work as expected.",
      );
      finalHtmlForIframe = `${WIDGET_DEMO_BASE_URL}` + htmlContentString;
    }
  }

  if (tokenLoading || htmlLoading) {
    return <div>Loading demo widget...</div>;
  }

  if (tokenError || htmlError) {
    return <div>Error loading demo widget. Please try again.</div>;
  }

  return (
    <div>
      <h1>Demo Widget</h1>
      {htmlSuccess && finalHtmlForIframe ? (
        <iframe
          srcDoc={finalHtmlForIframe}
          title="Demo Widget"
          // style={{ width: "100%", height: "600px", border: "none" }}
        />
      ) : (
        <p>Awaiting HTML content...</p>
      )}
    </div>
  );
};

export default Demo;
