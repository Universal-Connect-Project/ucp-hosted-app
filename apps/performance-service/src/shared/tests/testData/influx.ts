import { ComboJobTypes } from "@repo/shared-utils";
import { EventObject } from "../../../controllers/eventController";
import { recordPerformanceMetric } from "../../../services/influxDb";

export const createTestScenarioEvents = async (
  institutionId1: string,
  institutionId2: string,
) => {
  const events: EventObject[] = [
    {
      connectionId: "MBR-123",
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: institutionId1,
      aggregatorId: "mx",
      startedAt: 1700000000000,
      successAt: 1700000010000,
      userInteractionTime: 0,
    },
    {
      connectionId: "MBR-123",
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: institutionId1,
      aggregatorId: "mx",
      startedAt: 1700000000000,
      userInteractionTime: 0,
    },
    {
      connectionId: "MBR-123",
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: institutionId1,
      aggregatorId: "sophtron",
      startedAt: 1700000000000,
      successAt: 1700000030000,
      userInteractionTime: 0,
    },
    {
      connectionId: "MBR-123",
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: institutionId1,
      aggregatorId: "sophtron",
      startedAt: 1700000000000,
      successAt: 1700000020000,
      userInteractionTime: 0,
    },
    {
      connectionId: "MBR-123",
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: institutionId1,
      aggregatorId: "sophtron",
      startedAt: 1700000000000,
      successAt: 1700000010000,
      userInteractionTime: 0,
    },
    {
      connectionId: "MBR-123",
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: institutionId1,
      aggregatorId: "sophtron",
      startedAt: 1700000000000,
      userInteractionTime: 0,
    },
    {
      connectionId: "MBR-123",
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: institutionId1,
      aggregatorId: "finicity",
      startedAt: 1700000000000,
      userInteractionTime: 0,
    },
    {
      connectionId: "MBR-123",
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: institutionId1,
      aggregatorId: "finicity",
      startedAt: 1700000000000,
      userInteractionTime: 0,
    },
    {
      connectionId: "MBR-123",
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: institutionId1,
      aggregatorId: "finicity",
      startedAt: 1700000000000,
      userInteractionTime: 0,
    },
    {
      connectionId: "MBR-123",
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: institutionId1,
      aggregatorId: "finicity",
      startedAt: 1700000000000,
      successAt: 1700000030000,
      userInteractionTime: 0,
    },
    {
      connectionId: "MBR-123",
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.ACCOUNT_NUMBER],
      institutionId: institutionId1,
      aggregatorId: "finicity",
      startedAt: 1700000000000,
      successAt: 1700000010000,
      userInteractionTime: 5000,
    },
    {
      connectionId: "MBR-123",
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.TRANSACTIONS, ComboJobTypes.ACCOUNT_NUMBER],
      institutionId: institutionId2,
      aggregatorId: "mx",
      startedAt: 1700000000000,
      successAt: 1700000010000,
      userInteractionTime: 5000,
    },
    {
      connectionId: "MBR-123",
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.ACCOUNT_NUMBER],
      institutionId: institutionId2,
      aggregatorId: "finicity",
      startedAt: 1700000000000,
      userInteractionTime: 0,
    },
  ];

  await Promise.all(
    events.map((event: EventObject) => recordPerformanceMetric(event)),
  );
};

export const expectedTransformedInstitutionData = (
  institutionId1: string,
  institutionId2: string,
) => {
  const obj: Record<string, unknown> = {};

  obj[institutionId1] = {
    [`${ComboJobTypes.TRANSACTIONS}`]: {
      successRate: {
        mx: 50,
        sophtron: 75,
        finicity: 25,
      },
      jobDuration: {
        mx: 10,
        sophtron: 20,
        finicity: 30,
      },
    },
    [`${ComboJobTypes.ACCOUNT_NUMBER}`]: {
      successRate: {
        finicity: 100,
      },
      jobDuration: {
        finicity: 5,
      },
    },
  };

  obj[institutionId2] = {
    [`${ComboJobTypes.ACCOUNT_NUMBER},${ComboJobTypes.TRANSACTIONS}`]: {
      successRate: {
        mx: 100,
      },
      jobDuration: {
        mx: 5,
      },
    },
    [`${ComboJobTypes.ACCOUNT_NUMBER}`]: {
      successRate: {
        finicity: 0,
      },
      jobDuration: {},
    },
  };

  return obj;
};
