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
import {
  API_KEYS_COPY_BUTTON_TEST_ID,
  API_KEYS_HIDE_KEY_BUTTON_TEST_ID,
  API_KEYS_SHOW_KEY_BUTTON_TEST_ID,
} from "./constants";

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
                {showValue ? (
                  <VisibilityOffOutlined
                    data-testid={`${API_KEYS_HIDE_KEY_BUTTON_TEST_ID}-${label}`}
                  />
                ) : (
                  <VisibilityOutlined
                    data-testid={`${API_KEYS_SHOW_KEY_BUTTON_TEST_ID}-${label}`}
                  />
                )}
              </IconButton>
              <IconButton
                data-testid={`${API_KEYS_COPY_BUTTON_TEST_ID}-${label}`}
                onClick={handleCopyToClipboard}
              >
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
