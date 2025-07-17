import { Aggregator } from "@repo/shared-utils";
import { INSTITUTION_SERVICE_URL } from "../environment";
import { getPerformanceServiceAccessToken } from "../utils/getPerformanceServiceAccessToken";

interface AggregatorsResponse {
  aggregators: Aggregator[];
}

export const getAggregators = async (): Promise<AggregatorsResponse> => {
  const token = await getPerformanceServiceAccessToken();

  const response = await fetch(
    `${INSTITUTION_SERVICE_URL}/performanceAuth/aggregators`,
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

  return (await response.json()) as AggregatorsResponse;
};
