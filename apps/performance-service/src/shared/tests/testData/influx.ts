export const influxQueryResults = [
  {
    result: "_result",
    table: 0,
    aggregatorId: "mx",
    institutionId: "Wells Fargo",
    jobTypes: "aggregate",
    jobDuration: 6095,
    successRate: 0.5,
  },
  {
    result: "_result",
    table: 1,
    aggregatorId: "sophtron",
    institutionId: "Wells Fargo",
    jobTypes: "aggregate",
    jobDuration: 9095,
    successRate: 0.881234,
  },
  {
    result: "_result",
    table: 2,
    aggregatorId: "finicity",
    institutionId: "Wells Fargo",
    jobTypes: "aggregate",
    jobDuration: 4321,
    successRate: 0.221234,
  },
  {
    result: "_result",
    table: 3,
    aggregatorId: "finicity",
    institutionId: "Wells Fargo",
    jobTypes: "verification",
    jobDuration: 5000,
    successRate: 0.95,
  },
  {
    result: "_result",
    table: 4,
    aggregatorId: "mx",
    institutionId: "Chase",
    jobTypes: "aggregate_verification",
    jobDuration: 5000,
    successRate: 0.95,
  },
  {
    result: "_result",
    table: 4,
    aggregatorId: "finicity",
    institutionId: "Chase",
    jobTypes: "verification",
    jobDuration: 0,
    successRate: 0,
  },
];

export const transformedInstitutionData = {
  "Wells Fargo": {
    aggregate: {
      successRate: {
        mx: 50,
        sophtron: 88.12,
        finicity: 22.12,
      },
      jobDuration: {
        mx: 6.095,
        sophtron: 9.095,
        finicity: 4.321,
      },
    },
    verification: {
      successRate: {
        finicity: 95,
      },
      jobDuration: {
        finicity: 5,
      },
    },
  },
  Chase: {
    aggregate_verification: {
      successRate: {
        mx: 95,
      },
      jobDuration: {
        mx: 5,
      },
    },
    verification: {
      successRate: {
        finicity: 0,
      },
      jobDuration: {},
    },
  },
};
