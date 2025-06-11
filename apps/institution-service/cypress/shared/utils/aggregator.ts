import { USER_ACCESS_TOKEN_ENV } from "../constants/accessTokens";
import { createAuthorizationHeader } from "./authorization";

export const getAggregators = () => {
  return cy.request({
    url: "aggregators",
    method: "GET",
    failOnStatusCode: false,
    headers: {
      Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
    },
  });
};

export const getAggregatorsWithPerformance = ({
  timeFrame,
}: {
  timeFrame?: string;
}) => {
  return cy.request({
    url: "aggregators/performance",
    method: "GET",
    failOnStatusCode: false,
    qs: {
      timeFrame,
    },
    headers: {
      Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
    },
  });
};

const createGetAggregatorGraph =
  (url: string) =>
  ({
    aggregators,
    jobTypes,
    timeFrame,
  }: {
    aggregators?: string;
    jobTypes?: string;
    timeFrame?: string;
  }) => {
    return cy.request({
      url,
      method: "GET",
      failOnStatusCode: false,
      qs: {
        aggregators,
        jobTypes,
        timeFrame,
      },
      headers: {
        Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
      },
    });
  };

export const getAggregatorSuccessGraph = createGetAggregatorGraph(
  "aggregators/successGraph",
);
export const getAggregatorDurationGraph = createGetAggregatorGraph(
  "aggregators/durationGraph",
);
