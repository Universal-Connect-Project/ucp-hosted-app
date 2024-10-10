import { AggregatorIntegration } from "./api";

export const aggregatorIntegrationsSortByName = (
  a: AggregatorIntegration,
  b: AggregatorIntegration,
) => a.aggregator.displayName.localeCompare(b.aggregator.displayName);
