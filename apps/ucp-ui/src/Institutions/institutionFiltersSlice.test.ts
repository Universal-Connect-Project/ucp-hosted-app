import { createStore } from "../store";
import {
  clearInstitutionFilters,
  getInstitutionFilterSlice,
  getShouldShowInactiveIntegrations,
  setFilterAggregator,
  setFilterBoolean,
  setSearch,
} from "./institutionFiltersSlice";

describe("institution filter reducer", () => {
  describe("clearInstitutionFilters, getInstitutionSlice, and setSearch", () => {
    it("sets the search and resets the filters back to their initial state", () => {
      const store = createStore();

      store.dispatch(setSearch("test"));

      expect(getInstitutionFilterSlice(store.getState()).search).toEqual(
        "test",
      );

      store.dispatch(clearInstitutionFilters());

      expect(getInstitutionFilterSlice(store.getState())).toEqual({
        aggregatorName: [],
      });
    });
  });

  describe("setFilterAggregator", () => {
    it("adds an aggregator if it isn't there and the value is true", () => {
      const store = createStore();

      store.dispatch(setFilterAggregator({ name: "a", value: true }));

      expect(
        getInstitutionFilterSlice(store.getState()).aggregatorName,
      ).toEqual(["a"]);

      store.dispatch(setFilterAggregator({ name: "a", value: true }));

      expect(
        getInstitutionFilterSlice(store.getState()).aggregatorName,
      ).toEqual(["a"]);
    });

    it("removes an aggregator if its already there", () => {
      const store = createStore();

      store.dispatch(setFilterAggregator({ name: "a", value: true }));

      expect(
        getInstitutionFilterSlice(store.getState()).aggregatorName,
      ).toEqual(["a"]);

      store.dispatch(setFilterAggregator({ name: "a", value: false }));

      expect(
        getInstitutionFilterSlice(store.getState()).aggregatorName,
      ).toEqual([]);

      store.dispatch(setFilterAggregator({ name: "a", value: false }));

      expect(
        getInstitutionFilterSlice(store.getState()).aggregatorName,
      ).toEqual([]);
    });
  });

  describe("getSouldShowInactiveIntegrations", () => {
    it("returns false if includeInactiveIntegrations is false and toggles it", () => {
      const store = createStore();

      expect(getShouldShowInactiveIntegrations(store.getState())).toBe(false);

      store.dispatch(
        setFilterBoolean({ key: "includeInactiveIntegrations", value: true }),
      );

      expect(getShouldShowInactiveIntegrations(store.getState())).toBe(true);
    });
  });
});
