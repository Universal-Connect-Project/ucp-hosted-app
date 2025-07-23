import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppSelector } from "../utils/redux";

export interface Connection {
  aggregator: string;
  jobTypes: string[];
  institution: string;
}

interface DemoState {
  connections: Connection[];
}

const initialState: DemoState = {
  connections: [],
};

export const demoSlice = createSlice({
  name: "demo",
  initialState,
  reducers: {
    addConnection: (state, action: PayloadAction<Connection>) => {
      state.connections.push(action.payload);
    },
  },
});

export const { addConnection } = demoSlice.actions;
export const { reducer } = demoSlice;

export const getConnections = createAppSelector(
  (state) => state.demo,
  (demoState: DemoState) => demoState.connections,
);
