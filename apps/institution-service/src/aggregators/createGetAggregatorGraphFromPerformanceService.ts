import { GraphMetricsResponse } from "@repo/backend-utils";
import { getPerformanceServiceAccessToken } from "./getPerformanceServiceAccessToken";
import { PERFORMANCE_SERVICE_URL } from "../shared/environment";

export const createGetAggregatorGraphFromPerformanceService =
  (url: string) =>
  async ({
    aggregators,
    jobTypes,
    timeFrame,
  }: {
    aggregators: string | undefined;
    jobTypes: string | undefined;
    timeFrame: string | undefined;
  }): Promise<GraphMetricsResponse> => {
    const token = await getPerformanceServiceAccessToken();
    const queryParams = Object.entries({
      aggregators,
      jobTypes,
      timeFrame,
    }).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    const params = new URLSearchParams(queryParams);

    const response = await fetch(
      `${PERFORMANCE_SERVICE_URL}/metrics/${url}?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const errorData: { error: string } = await response.json();

      throw new Error(errorData.error);
    }

    return (await response.json()) as GraphMetricsResponse;
  };
