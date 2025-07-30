import { widgetEnabledAggregators } from "./constants";

export const createWidgetEnabledAggregatorToLabelMap = (
  aggregators?: { name: string; displayName: string }[],
): Record<string, string> | undefined => {
  return aggregators
    ?.filter((aggregator: { name: string }) =>
      widgetEnabledAggregators.includes(aggregator.name),
    )
    .reduce(
      (acc, aggregator) => ({
        ...acc,
        [aggregator.name]: aggregator.displayName,
      }),
      {},
    );
};
