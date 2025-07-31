import { createStore } from "../../store";
import { addConnection, getConnections, Connection } from "./demo";

describe("demo slice", () => {
  it("should add a connection", () => {
    const store = createStore();
    const newConnection: Connection = {
      aggregator: "MX",
      jobTypes: ["accountNumber"],
      institution: "Test Bank",
    };
    store.dispatch(addConnection(newConnection));
    const connections = getConnections(store.getState());
    expect(connections).toHaveLength(1);
    expect(connections[0]).toEqual(newConnection);
  });
});
