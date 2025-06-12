import { MenuItem, TextField } from "@mui/material";
import React, { ChangeEvent, useState } from "react";
import {
  thirtyDaysOption,
  TIME_FRAME_LABEL_TEXT,
  timeFrameOptions,
} from "./constants";
import styles from "./timeFrameSelect.module.css";

export const useTimeFrameSelect = () => {
  const [timeFrame, setTimeFrame] = useState(thirtyDaysOption.value);

  const handleTimeFrameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTimeFrame(event.target.value);
  };

  return {
    timeFrame,
    handleTimeFrameChange,
  };
};

const TimeFrameSelect = ({
  onChange,
  value,
}: {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value: string;
}) => {
  return (
    <TextField
      className={styles.timeFrameSelect}
      label={TIME_FRAME_LABEL_TEXT}
      onChange={onChange}
      select
      value={value}
    >
      {timeFrameOptions.map(({ label, value }) => (
        <MenuItem key={value} value={value}>
          {label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default TimeFrameSelect;
