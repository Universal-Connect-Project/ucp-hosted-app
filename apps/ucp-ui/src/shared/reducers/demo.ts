import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppSelector } from "../utils/redux";

interface Connection {
  aggregator: string;
  jobTypes: string[];
  institution: string;
}

interface DemoState {
  aggregator: string | null;
  jobTypes: string[];
  connections: Connection[];
}

const initialState: DemoState = {
  aggregator: null,
  jobTypes: [],
  connections: [],
};

export const demoSlice = createSlice({
  name: "demo",
  initialState,
  reducers: {
    setConnectionDetails: (
      state,
      action: PayloadAction<{ aggregator: string; jobTypes: string[] }>,
    ) => {
      state.aggregator = action.payload.aggregator;
      state.jobTypes = action.payload.jobTypes;
    },
    addConnection: (state, action: PayloadAction<string>) => {
      if (state.aggregator && state.jobTypes.length > 0) {
        state.connections.push({
          aggregator: state.aggregator,
          jobTypes: state.jobTypes,
          institution: action.payload,
        });
      }
    },
  },
});

export const { setConnectionDetails, addConnection } = demoSlice.actions;
export const { reducer } = demoSlice;

export const getConnections = createAppSelector(
  (state) => state.demo,
  (demoState: DemoState) => demoState.connections,
);
