import { Stack, TextField, Typography } from "@mui/material";
import React from "react";
import {
  InputSkeletonIfLoading,
  TextSkeletonIfLoading,
} from "../shared/components/SkeletonIfLoading";

const ApiKey = ({
  isLoading,
  label,
  value,
}: {
  isLoading: boolean;
  label: string;
  value?: string;
}) => {
  return (
    <Stack spacing={1}>
      <TextSkeletonIfLoading isLoading={isLoading}>
        <Typography variant="subtitle1">
          <label htmlFor={label}>{label}</label>
        </Typography>
      </TextSkeletonIfLoading>
      <InputSkeletonIfLoading isLoading={isLoading}>
        <TextField
          fullWidth
          InputProps={{
            readOnly: true,
            id: label,
          }}
          type="password"
          value={value}
        />
      </InputSkeletonIfLoading>
    </Stack>
  );
};

export default ApiKey;
