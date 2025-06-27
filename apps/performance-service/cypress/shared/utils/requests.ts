import {
  INSTITUTION_SERVICE_ACCESS_TOKEN,
  UCP_UI_USER_ACCESS_TOKEN,
  WIDGET_ACCESS_TOKEN,
} from "../constants/accessTokens";
import { createAuthorizationHeader } from "./authorization";
import { ComboJobTypes } from "@repo/shared-utils";

type ComboJobType = (typeof ComboJobTypes)[keyof typeof ComboJobTypes];
interface ConnectionStartRequestBody {
  jobTypes: ComboJobType[];
  institutionId: string;
  aggregatorId: string;
  recordDuration?: boolean;
}

export const testInstitutionId = "testInstitutionId";
export const testAggregatorId = "testAggregatorId";

export const startConnectionEventRequest = ({
  connectionId,
  body = {
    jobTypes: [ComboJobTypes.TRANSACTIONS],
    institutionId: testInstitutionId,
    aggregatorId: testAggregatorId,
    recordDuration: true,
  },
  failOnStatusCode = true,
}: {
  connectionId: string;
  body?: ConnectionStartRequestBody;
  failOnStatusCode?: boolean;
}) => {
  return cy.request({
    url: `events/${connectionId}/connectionStart`,
    method: "POST",
    failOnStatusCode,
    headers: {
      Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
    },
    body,
  });
};

export const pauseConnectionEventRequest = (connectionId: string) => {
  return cy.request({
    url: `events/${connectionId}/connectionPause`,
    method: "PUT",
    headers: {
      Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
    },
  });
};

export const unpauseConnectionEventRequest = (
  connectionId: string,
  failOnStatusCode: boolean = true,
) => {
  return cy.request({
    url: `events/${connectionId}/connectionResume`,
    method: "PUT",
    failOnStatusCode,
    headers: {
      Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
    },
  });
};

export const markSuccessfulEventRequest = (connectionId: string) => {
  return cy.request({
    url: `events/${connectionId}/connectionSuccess`,
    method: "PUT",
    headers: {
      Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
    },
  });
};

export const getAllPerformanceData = () => {
  return cy.request({
    url: "metrics/allPerformanceData",
    method: "GET",
    headers: {
      Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
    },
  });
};

export const getInstitutionSuccessGraphPerformanceData = ({
  aggregators,
  institutionId,
  jobTypes,
  timeFrame,
}: {
  aggregators?: string;
  institutionId: string;
  jobTypes?: string;
  timeFrame?: string;
}) => {
  return cy.request({
    url: `metrics/institution/${institutionId}/successGraph`,
    qs: {
      timeFrame,
      jobTypes,
      aggregators,
    },
    method: "GET",
    failOnStatusCode: false,
    headers: {
      Authorization: createAuthorizationHeader(UCP_UI_USER_ACCESS_TOKEN),
    },
  });
};

export const getAggregatorSuccessGraphPerformanceData = ({
  timeFrame,
  jobTypes,
  aggregators,
}: {
  timeFrame?: string;
  jobTypes?: string;
  aggregators?: string;
}) => {
  return cy.request({
    url: "metrics/aggregatorSuccessGraph",
    qs: {
      timeFrame,
      jobTypes,
      aggregators,
    },
    method: "GET",
    failOnStatusCode: false,
    headers: {
      Authorization: createAuthorizationHeader(
        INSTITUTION_SERVICE_ACCESS_TOKEN,
      ),
    },
  });
};

export const getAggregatorDurationGraphPerformanceData = ({
  timeFrame,
  jobTypes,
  aggregators,
}: {
  timeFrame?: string;
  jobTypes?: string;
  aggregators?: string;
}) => {
  return cy.request({
    url: "metrics/aggregatorDurationGraph",
    qs: {
      timeFrame,
      jobTypes,
      aggregators,
    },
    method: "GET",
    failOnStatusCode: false,
    headers: {
      Authorization: createAuthorizationHeader(
        INSTITUTION_SERVICE_ACCESS_TOKEN,
      ),
    },
  });
};

export const getAggregatorPerformanceMetrics = ({
  timeFrame,
}: {
  timeFrame?: string;
}) => {
  return cy.request({
    url: "metrics/aggregators",
    qs: {
      timeFrame,
    },
    method: "GET",
    failOnStatusCode: false,
    headers: {
      Authorization: createAuthorizationHeader(
        INSTITUTION_SERVICE_ACCESS_TOKEN,
      ),
    },
  });
};
