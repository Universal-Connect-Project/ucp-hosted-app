import {
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  InputSkeletonIfLoading,
  TextSkeletonIfLoading,
} from "../shared/components/SkeletonIfLoading";
import {
  ContentCopyOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useAppDispatch } from "../shared/utils/redux";
import { displaySnackbar } from "../shared/reducers/snackbar";

const ApiKey = ({
  isLoading,
  label,
  value,
}: {
  isLoading: boolean;
  label: string;
  value?: string;
}) => {
  const [showValue, setShowValue] = useState(false);

  const dispatch = useAppDispatch();

  const handleCopyToClipboard = () => {
    void navigator.clipboard.writeText(value as string);

    dispatch(displaySnackbar(`${label} has been copied to your clipboard.`));
  };

  return (
    <Stack spacing={1}>
      <TextSkeletonIfLoading isLoading={isLoading}>
        <Typography variant="subtitle1">
          <label htmlFor={label}>{label}</label>
        </Typography>
      </TextSkeletonIfLoading>
      <InputSkeletonIfLoading isLoading={isLoading}>
        <OutlinedInput
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={() => setShowValue(!showValue)}>
                {showValue ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
              </IconButton>
              <IconButton onClick={handleCopyToClipboard}>
                <ContentCopyOutlined />
              </IconButton>
            </InputAdornment>
          }
          id={label}
          fullWidth
          readOnly
          type={showValue ? "text" : "password"}
          value={value}
        />
      </InputSkeletonIfLoading>
    </Stack>
  );
};

export default ApiKey;
