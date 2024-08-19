import React from "react";
import { useAppDispatch, useAppSelector } from "../shared/utils/redux";
import {
  closeSnackbar,
  getIsSnackbarOpen,
  getSnackbarMessage,
} from "../shared/reducers/snackbar";
import { Snackbar } from "@mui/material";

const Snackbars = () => {
  const dispatch = useAppDispatch();

  const message = useAppSelector(getSnackbarMessage);
  const isOpen = useAppSelector(getIsSnackbarOpen);

  const handleClose = () => {
    dispatch(closeSnackbar());
  };

  return (
    <Snackbar
      ClickAwayListenerProps={{
        mouseEvent: "onMouseDown",
      }}
      message={message}
      onClose={handleClose}
      open={isOpen}
    />
  );
};

export default Snackbars;
