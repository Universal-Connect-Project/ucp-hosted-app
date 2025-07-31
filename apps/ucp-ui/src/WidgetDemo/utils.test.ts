import { createWidgetEnabledAggregatorToLabelMap } from "./utils";

describe("utils", () => {
  it("should create a map of widget enabled aggregators to their labels", () => {
    const aggregators = [
      { name: "mx", displayName: "MX" },
      { name: "sophtron", displayName: "Sophtron" },
    ];
    const expectedMap = {
      mx: "MX",
      sophtron: "Sophtron",
    };
    const result = createWidgetEnabledAggregatorToLabelMap(aggregators);
    expect(result).toEqual(expectedMap);
  });

  it("should return an empty object if no aggregators are provided", () => {
    const result = createWidgetEnabledAggregatorToLabelMap([]);
    expect(result).toEqual({});
  });
});
