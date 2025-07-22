import { createStore } from "../../store";
import { setConnectionDetails, addConnection, getConnections } from "./demo";

describe("demo slice", () => {
  it("should handle setConnectionDetails", () => {
    const store = createStore();
    const payload = { aggregator: "MX", jobTypes: ["accountNumber"] };
    store.dispatch(setConnectionDetails(payload));
    const state = store.getState().demo;
    expect(state.aggregator).toEqual("MX");
    expect(state.jobTypes).toEqual(["accountNumber"]);
  });

  describe("addConnection", () => {
    it("should add a connection when aggregator and jobTypes are set", () => {
      const connectionState = [
        {
          aggregator: "MX",
          jobTypes: ["accountNumber"],
          institution: "Test Bank",
        },
      ];
      const store = createStore();
      store.dispatch(
        setConnectionDetails({
          aggregator: "MX",
          jobTypes: ["accountNumber"],
        }),
      );
      store.dispatch(addConnection("Test Bank"));

      expect(getConnections(store.getState())).toEqual(connectionState);
    });

    it("should not add a connection if aggregator is null", () => {
      const store = createStore();
      store.dispatch(addConnection("Test Bank"));
      const state = store.getState();
      expect(state.demo.connections).toHaveLength(0);
    });

    it("should not add a connection if jobTypes is empty", () => {
      const store = createStore();
      store.dispatch(setConnectionDetails({ aggregator: "MX", jobTypes: [] }));
      store.dispatch(addConnection("Test Bank"));
      const state = store.getState();
      expect(state.demo.connections).toHaveLength(0);
    });
  });
});
