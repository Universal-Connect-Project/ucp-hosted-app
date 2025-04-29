import { Request, Response } from "express";
import { Aggregator } from "../models/aggregator";
import { PERFORMANCE_SERVICE_URL } from "../shared/environment";

export const getAggregators = async (req: Request, res: Response) => {
  try {
    const aggregators = await Aggregator.findAll({
      order: [
        ["displayName", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    res.status(200).json({
      aggregators,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching aggregators." });
  }
};

export const getAggregatorsWithPerformance = async (
  req: Request,
  res: Response,
) => {
  try {
    const aggregators = await Aggregator.findAll({
      order: [
        ["displayName", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    try {
      const { timeFrame } = req.query as { timeFrame: string | undefined };
      const withPerformanceMetrics = await includeAggregatorPerformance(
        aggregators,
        timeFrame,
      );
      res.status(200).json({
        aggregators: withPerformanceMetrics,
      });
    } catch (error) {
      const err = error as Error;

      res.status(503).json({
        error: err.message,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching aggregators." });
  }
};

const includeAggregatorPerformance = async (
  aggregators: Aggregator[],
  timeFrame: string | undefined,
) => {
  const performance = await getAggregatorPerformance(timeFrame || "30d");
  return aggregators.map((aggregator) => {
    const aggPerformance = performance[aggregator.name];
    return {
      ...aggregator.dataValues,
      avgSuccessRate: aggPerformance?.avgSuccessRate ?? null,
      avgDuration: aggPerformance?.avgDuration || null,
      jobTypes: aggPerformance?.jobTypes || {},
    };
  });
};

interface JobSpecificData {
  avgSuccessRate: number;
  avgDuration: number;
}

interface IndividualAggregatorMetrics {
  avgSuccessRate: number | undefined;
  avgDuration: number | undefined;
  jobTypes: Record<string, JobSpecificData>;
}

type AggregatorMetrics = Record<string, IndividualAggregatorMetrics>;

const getAggregatorPerformance = async (
  timeFrame: string,
): Promise<AggregatorMetrics> => {
  const token = await getAccessToken();
  const params = new URLSearchParams({ timeFrame });

  const response = await fetch(
    `${PERFORMANCE_SERVICE_URL}/metrics/aggregators?${params.toString()}`,
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

  return (await response.json()) as AggregatorMetrics;
};

let tokenCache: { token: string; expiresAt: number } | null = null;

const getAccessToken = async (): Promise<string> => {
  const now = Date.now();

  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  const response = await fetch(
    `https://${process.env.AUTH0_DOMAIN!}/oauth/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.AUTH0_INSTITUTION_CLIENT_ID!,
        client_secret: process.env.AUTH0_INSTITUTION_CLIENT_SECRET!,
        audience: "institution-service",
        grant_type: "client_credentials",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Auth0 token request failed: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };
  const expiresInMs = data.expires_in * 1000;

  tokenCache = {
    token: data.access_token,
    expiresAt: now + expiresInMs - 5000, // Refresh 5s before expiry
  };

  return data.access_token;
};
