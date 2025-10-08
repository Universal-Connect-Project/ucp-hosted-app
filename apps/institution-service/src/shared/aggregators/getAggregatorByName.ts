import { Aggregator } from "../../models/aggregator";

export const getAggregatorByName = async (name: string) => {
  const aggregator = await Aggregator.findOne({
    where: { name },
    raw: true,
  });

  if (!aggregator) {
    throw new Error(`No aggregator found with name: ${name}`);
  }

  return aggregator;
};
