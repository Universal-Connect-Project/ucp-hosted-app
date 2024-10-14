import { AggregatorIntegration } from "./api";

export const aggregatorIntegrationsSortByName = (
  a: AggregatorIntegration,
  b: AggregatorIntegration,
) => a.aggregator.displayName.localeCompare(b.aggregator.displayName);

export const isEmptyStr = (str: string | undefined) => {
  return !str || str.length === 0;
};
