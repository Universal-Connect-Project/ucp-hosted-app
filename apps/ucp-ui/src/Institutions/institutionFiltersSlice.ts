import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppSelector } from "../shared/utils/redux";
import { RootState } from "../store";

export interface InstitutionFilterBooleans {
  includeInactiveIntegrations?: boolean;
  supportsAggregation?: boolean;
  supportsHistory?: boolean;
  supportsIdentification?: boolean;
  supportsOauth?: boolean;
  supportsVerification?: boolean;
}

export interface InstitutionFilterState extends InstitutionFilterBooleans {
  aggregatorName: string[];
  search?: string;
  supportsAggregation?: boolean;
  supportsHistory?: boolean;
  supportsIdentification?: boolean;
  supportsOauth?: boolean;
  supportsVerification?: boolean;
}

const initialState: InstitutionFilterState = {
  aggregatorName: [],
};

export const institutionFilterSlice = createSlice({
  initialState,
  name: "institutionFilter",
  reducers: {
    clearInstitutionFilters: () => initialState,
    setFilterBoolean: (
      state,
      action: PayloadAction<{
        key: keyof InstitutionFilterBooleans;
        value: boolean;
      }>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },
    setFilterAggregator: (
      state,
      action: PayloadAction<{
        name: string;
        value: boolean;
      }>,
    ) => {
      const { aggregatorName } = state;

      const { name, value } = action.payload;

      const isAggregatorAlreadyIncluded = aggregatorName.includes(name);

      if (value) {
        if (!isAggregatorAlreadyIncluded) {
          state.aggregatorName = [...state.aggregatorName, name];
        }
      } else {
        if (isAggregatorAlreadyIncluded) {
          state.aggregatorName = state.aggregatorName.filter(
            (current) => current !== name,
          );
        }
      }
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
});

export const {
  clearInstitutionFilters,
  setFilterBoolean,
  setFilterAggregator,
  setSearch,
} = institutionFilterSlice.actions;

export const getInstitutionFilterSlice = createAppSelector(
  (state) => state,
  (state: RootState) => state.institutionFilter,
);

export const getShouldShowInactiveIntegrations = createAppSelector(
  getInstitutionFilterSlice,
  (slice) => slice.includeInactiveIntegrations,
);
