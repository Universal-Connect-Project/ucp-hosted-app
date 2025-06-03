import { PERFORMANCE_SERVICE_URL } from "../shared/environment";
import { getPerformanceServiceAccessToken } from "./getPerformanceServiceAccessToken";

export const getAggregatorSuccessGraph = () => {};

const getSuccessGraphFromPerformanceService = async (timeFrame: string) => {
  const token = await getPerformanceServiceAccessToken();
  const params = new URLSearchParams({ timeFrame });

  const response = await fetch(
    `${PERFORMANCE_SERVICE_URL}/metrics/aggregatorSuccessGraph?${params.toString()}`,
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

  return await response.json();
};
