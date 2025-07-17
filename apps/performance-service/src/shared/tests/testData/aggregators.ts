export const testAggregators = [
  {
    id: 2,
    name: "finicity",
    displayName: "Finicity",
    logo: "https://universalconnectproject.org/images/ucp-logo-icon.svg",
    createdAt: "2025-06-16T14:21:34.230Z",
    updatedAt: "2025-06-16T14:21:34.230Z",
  },
  {
    id: 98,
    name: "mx",
    displayName: "MX",
    logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-3aeb38da-26e4-3818-e0fa-673315ab7754_100x100.png",
    createdAt: "2025-06-16T14:21:34.071Z",
    updatedAt: "2025-06-16T14:21:34.071Z",
  },
  {
    id: 1,
    name: "sophtron",
    displayName: "Sophtron",
    logo: "https://sophtron.com/Images/logo.png",
    createdAt: "2025-06-16T14:21:34.227Z",
    updatedAt: "2025-06-16T14:21:34.227Z",
  },
];

export const testAggregatorsWithIndexes = testAggregators.map(
  (aggregator, index) => ({
    ...aggregator,
    aggregatorIndex: index,
  }),
);
