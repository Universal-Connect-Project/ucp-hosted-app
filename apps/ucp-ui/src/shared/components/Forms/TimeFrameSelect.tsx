import { MenuItem, TextField } from "@mui/material";
import React, { ChangeEvent } from "react";
import { TIME_FRAME_LABEL_TEXT, timeFrameOptions } from "./constants";
import styles from "./timeFrameSelect.module.css";

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
