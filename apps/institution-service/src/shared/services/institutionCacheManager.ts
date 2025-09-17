import { Aggregator } from "../../models/aggregator";
import { Institution } from "../../models/institution";
import { transformInstitutionToCachedInstitution } from "../../services/institutionService";
import { CachedInstitution } from "../../tasks/loadInstitutionsFromJson";

interface CachedInstitutionData {
  data: CachedInstitution[];
  timestamp: number;
}

let cache: CachedInstitutionData | null = null;
let fetchPromise: Promise<CachedInstitution[]> | null = null;
const CACHE_TTL_MS = 300 * 1000; // 5 minutes in milliseconds

const isCacheValid = (): boolean => {
  if (!cache) {
    return false;
  }
  const now = Date.now();
  return now - cache.timestamp < CACHE_TTL_MS;
};

const fetchInstitutionsFromDatabase = async (): Promise<
  CachedInstitution[]
> => {
  const institutions = await Institution.findAll({
    include: [
      {
        association: Institution.associations.aggregatorIntegrations,
        attributes: [
          ["aggregator_institution_id", "id"],
          "supports_oauth",
          "supports_identification",
          "supports_verification",
          "supports_aggregation",
          "supports_history",
          "supportsRewards",
          "supportsBalance",
        ],
        where: {
          isActive: true,
        },
        include: [
          {
            model: Aggregator,
            as: "aggregator",
            attributes: ["name", "id"],
          },
        ],
      },
    ],
  });

  return institutions.map(transformInstitutionToCachedInstitution);
};

export const getCachedInstitutionList = async (): Promise<
  CachedInstitution[]
> => {
  if (isCacheValid()) {
    return cache!.data;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = fetchInstitutionsFromDatabase();

  try {
    const freshData = await fetchPromise;

    cache = {
      data: freshData,
      timestamp: Date.now(),
    };

    return freshData;
  } finally {
    fetchPromise = null;
  }
};

export const clearInstitutionCache = (): void => {
  cache = null;
  fetchPromise = null;
};

// Get cache status for debugging/testing
export const getInstitutionCacheStatus = (): {
  exists: boolean;
  age?: number;
  valid?: boolean;
  timestamp?: number;
} => {
  if (!cache) {
    return { exists: false };
  }

  const age = Date.now() - cache.timestamp;
  return {
    exists: true,
    age,
    timestamp: cache.timestamp,
    valid: isCacheValid(),
  };
};
