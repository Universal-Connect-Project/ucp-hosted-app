import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppSelector } from "../utils/redux";
import { jwtDecode } from "jwt-decode";

interface TokenState {
  token: string | undefined;
}

export interface DecodedToken {
  permissions: string[];
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

export const getUserPermissions = createAppSelector(getAccessToken, (token) => {
  if (!token) {
    return [];
  }
  const DecodedToken: DecodedToken = jwtDecode(token);
  return DecodedToken.permissions;
});
