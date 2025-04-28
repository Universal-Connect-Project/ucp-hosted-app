import React, { ChangeEvent, useState } from "react";
import { useGetAggregatorPerformanceByJobTypeQuery } from "./api";
import TextField from "../../shared/components/Forms/TextField";
import { MenuItem } from "@mui/material";
import styles from "./byJobType.module.css";

const ByJobType = () => {
  const thirtyDays = "30d";

  const timeFrameOptions = [
    {
      label: "Last 1 Day",
      value: "1d",
    },
    {
      label: "Last 7 Days",
      value: "1w",
    },
    {
      label: "Last 30 Days",
      value: thirtyDays,
    },
    {
      label: "Last 180 Days",
      value: "180d",
    },
    {
      label: "Last 365 Days",
      value: "1y",
    },
  ];

  const [timeFrame, setTimeFrame] = useState(thirtyDays);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTimeFrame(event.target.value);
  };

  useGetAggregatorPerformanceByJobTypeQuery({ timeFrame });

  return (
    <TextField
      className={styles.timeFrameSelect}
      label="Time Frame"
      onChange={handleChange}
      select
      value={timeFrame}
    >
      {timeFrameOptions.map(({ label, value }) => (
        <MenuItem key={value} value={value}>
          {label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default ByJobType;
