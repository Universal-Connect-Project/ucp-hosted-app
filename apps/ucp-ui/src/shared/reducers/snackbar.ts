import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppSelector } from "../utils/redux";
import { RootState } from "../../store";

interface SnackbarState {
  isOpen: boolean;
  message: string | undefined;
}

const initialState: SnackbarState = {
  isOpen: false,
  message: undefined,
};

export const snackbarSlice = createSlice({
  initialState,
  name: "snackbar",
  reducers: {
    closeSnackbar: (state) => {
      state.isOpen = false;
    },
    displaySnackbar: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
      state.isOpen = true;
    },
  },
});

export const { closeSnackbar, displaySnackbar } = snackbarSlice.actions;

export const getSnackbarSlice = createAppSelector(
  (state) => state,
  (state: RootState) => state.snackbar,
);

export const getSnackbarMessage = createAppSelector(
  getSnackbarSlice,
  (slice) => slice.message,
);

export const getIsSnackbarOpen = createAppSelector(
  getSnackbarSlice,
  (slice) => slice.isOpen,
);
