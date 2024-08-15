import React, { useEffect } from "react";
import { useAppSelector } from "../shared/utils/redux";
import { getSnackbarSlice } from "../shared/reducers/snackbar";
import useSuccessSnackbar from "../shared/hooks/useSuccessSnackbar";
import { Snackbar } from "@mui/material";

const Snackbars = () => {
  const { message, messageId } = useAppSelector(getSnackbarSlice);

  const { handleOpenSuccessSnackbarWithMessage, successSnackbarProps } =
    useSuccessSnackbar();

  useEffect(() => {
    successSnackbarProps.onClose();

    if (message) {
      handleOpenSuccessSnackbarWithMessage(message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, messageId]);

  return <Snackbar {...successSnackbarProps} />;
};

export default Snackbars;
