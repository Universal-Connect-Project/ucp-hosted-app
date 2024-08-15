import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppSelector } from "../utils/redux";
import { RootState } from "../../store";

interface SnackbarState {
  message: string | undefined;
  messageId: string | undefined;
}

const initialState: SnackbarState = {
  messageId: undefined,
  message: undefined,
};

export const snackbarSlice = createSlice({
  initialState,
  name: "snackbar",
  reducers: {
    displaySnackbar: (state, action: PayloadAction<string>) => {
      state.messageId = crypto.randomUUID();
      state.message = action.payload;
    },
  },
});

export const { displaySnackbar } = snackbarSlice.actions;

export const getSnackbarSlice = createAppSelector(
  (state) => state,
  (state: RootState) => state.snackbar,
);
