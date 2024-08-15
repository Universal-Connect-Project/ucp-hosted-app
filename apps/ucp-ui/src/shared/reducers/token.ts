import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppSelector } from "../utils/redux";

interface TokenState {
  token: string | undefined;
}

const initialState: TokenState = {
  token: undefined,
};

export const tokenSlice = createSlice({
  initialState,
  name: "token",
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
});

export const { setAccessToken } = tokenSlice.actions;

export const getAccessToken = createAppSelector(
  (state) => state.token,
  (tokenState: TokenState) => tokenState.token,
);
