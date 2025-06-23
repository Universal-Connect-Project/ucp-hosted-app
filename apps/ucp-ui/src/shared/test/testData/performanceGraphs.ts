const aggregatorThatsOnlyInDurationGraph = "durationGraphAggregator1";
const aggregatorThatsOnlyInSuccessGraph = "successGraphAggregator1";

export const durationGraphData = {
  aggregators: [
    {
      aggregatorIndex: 0,
      id: 2,
      name: "finicity",
      displayName: aggregatorThatsOnlyInDurationGraph,
      logo: "https://universalconnectproject.org/images/ucp-logo-icon.svg",
      createdAt: "2025-06-16T14:21:34.230Z",
      updatedAt: "2025-06-16T14:21:34.230Z",
    },
    {
      aggregatorIndex: 1,
      id: 98,
      name: "mx",
      displayName: "MX",
      logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-3aeb38da-26e4-3818-e0fa-673315ab7754_100x100.png",
      createdAt: "2025-06-16T14:21:34.071Z",
      updatedAt: "2025-06-16T14:21:34.071Z",
    },
  ],
  performance: [
    {
      start: "2025-05-19T04:00:00Z",
      midpoint: "2025-05-19T16:00:00.000Z",
      stop: "2025-05-20T04:00:00Z",
      finicity: null,
      mx: null,
      sophtron: 137000,
    },
    {
      start: "2025-05-20T04:00:00Z",
      midpoint: "2025-05-20T16:00:00.000Z",
      stop: "2025-05-21T04:00:00Z",
      finicity: null,
      mx: 176000,
      sophtron: null,
    },
  ],
};

export const successGraphData = {
  aggregators: [
    {
      aggregatorIndex: 0,
      id: 2,
      name: "finicity",
      displayName: aggregatorThatsOnlyInSuccessGraph,
      logo: "https://universalconnectproject.org/images/ucp-logo-icon.svg",
      createdAt: "2025-06-16T14:21:34.230Z",
      updatedAt: "2025-06-16T14:21:34.230Z",
    },
    {
      aggregatorIndex: 1,
      id: 98,
      name: "mx",
      displayName: "MX",
      logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-3aeb38da-26e4-3818-e0fa-673315ab7754_100x100.png",
      createdAt: "2025-06-16T14:21:34.071Z",
      updatedAt: "2025-06-16T14:21:34.071Z",
    },
  ],
  performance: [
    {
      start: "2025-05-19T04:00:00Z",
      midpoint: "2025-05-19T16:00:00.000Z",
      stop: "2025-05-20T04:00:00Z",
      finicity: null,
      mx: null,
      sophtron: 1,
    },
    {
      start: "2025-05-20T04:00:00Z",
      midpoint: "2025-05-20T16:00:00.000Z",
      stop: "2025-05-21T04:00:00Z",
      finicity: null,
      mx: 1,
      sophtron: null,
    },
  ],
};
