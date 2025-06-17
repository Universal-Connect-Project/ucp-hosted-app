import React from "react";
import { useGetDemoTokenQuery, useGetDemoURLQuery } from "./api";
import { useAuth0 } from "@auth0/auth0-react";

const Demo = () => {
  const userId = "some-user-id"; // Replace with actual user ID logic
  const { data } = useGetDemoTokenQuery({ userId: userId as string });

  const token = data?.token;
  const { data: demoURLData } = useGetDemoURLQuery({ token: token as string });

  const demoURL = demoURLData?.url;

  return (
    <div>
      <h1>Demo Widget</h1>
      {demoURL ? (
        <iframe
          src={demoURL}
          title="Demo Widget"
          style={{ width: "100%", height: "600px", border: "none" }}
        />
      ) : (
        <p>Loading demo widget...</p>
      )}
    </div>
  );
};

export default Demo;
