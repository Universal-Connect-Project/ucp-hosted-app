import { getAggregatorByName } from "./getAggregatorByName";

describe("getAggregatorByName", () => {
  it("returns the aggregator when found", async () => {
    const aggregator = await getAggregatorByName("finicity");
    expect(aggregator).toBeDefined();
    expect(aggregator.name).toBe("finicity");
  });

  it("throws an error when no aggregator is found", async () => {
    await expect(getAggregatorByName("nonExistentAggregator")).rejects.toThrow(
      `No aggregator found with name: nonExistentAggregator`,
    );
  });
});
