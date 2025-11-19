import { HttpsProxyAgent } from "https-proxy-agent";
import axios, { AxiosError } from "axios";
import { getConfig } from "../../shared/environment";
import { createAggregatorInstitutionSyncer } from "./createAggregatorInstitutionSyncer";
import { getShouldLimitRequestsForE2E } from "./utils";

interface MXInstitution {
  code: string;
  is_hidden: boolean;
  name: string;
  supported_products: string[];
  supports_oauth: boolean;
  url: string;
}

interface MXInstitutionsResponse {
  institutions: MXInstitution[];
  pagination: {
    total_pages: number;
  };
}

export const FETCH_MX_INSTITUTIONS_URL = "https://api.mx.com/institutions";

const MXJobTypeMap = {
  supportsAccountNumber: "account_verification",
  supportsAccountOwner: "identity_verification",
  supportsTransactions: "transactions",
  supportsTransactionHistory: "transaction_history",
};

export const mapMXInstitution = (mxInstitution: MXInstitution) => {
  const supportsJobTypesProps = Object.keys(MXJobTypeMap).reduce((acc, key) => {
    const mxProduct = MXJobTypeMap[key as keyof typeof MXJobTypeMap];

    return {
      ...acc,
      [key]: mxInstitution.supported_products.includes(mxProduct),
    };
  }, {});

  return {
    ...supportsJobTypesProps,
    id: mxInstitution.code,
    name: mxInstitution.name,
    supportsBalance: false,
    supportsOAuth: mxInstitution.supports_oauth,
    supportsRewards: false,
    url: mxInstitution.url,
  };
};

const fetchAndConvertInstitutionPage = async ({
  e2eLimitRequests,
  page,
}: {
  e2eLimitRequests?: boolean;
  page: number;
}) => {
  const { MX_API_SECRET, MX_CLIENT_ID, PROXY_URL } = getConfig();

  const agent = PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : undefined;

  const axiosWithProxy = axios.create({
    httpsAgent: agent,
  });

  const shouldLimitRequestsForE2E =
    getShouldLimitRequestsForE2E(!!e2eLimitRequests);

  const pageSize = shouldLimitRequestsForE2E ? 60 : 100;

  const e2eNameQueryString = shouldLimitRequestsForE2E ? `&name=capital` : "";

  try {
    const response = await axiosWithProxy.get(
      `${FETCH_MX_INSTITUTIONS_URL}?page=${page}&records_per_page=${pageSize}${e2eNameQueryString}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "Accept-Version": "v20250224",
          Authorization: `Basic ${btoa(`${MX_CLIENT_ID}:${MX_API_SECRET}`)}`,
        },
      },
    );

    const {
      pagination: { total_pages },
      institutions,
    } = response.data as MXInstitutionsResponse;

    const nonHiddenInstitutions = institutions.filter(
      (institution) => !institution.is_hidden,
    );

    const convertedInstitutions = nonHiddenInstitutions.map(mapMXInstitution);

    return {
      convertedInstitutions,
      totalPages:
        shouldLimitRequestsForE2E && total_pages > 2 ? 2 : total_pages,
    };
  } catch (e) {
    const error = e as AxiosError;

    throw new Error(
      `Failed to fetch institutions from MX: ${error?.response?.statusText}`,
    );
  }
};

export const syncMXInstitutions = async ({
  e2eLimitRequests,
}: {
  e2eLimitRequests?: boolean;
}) => {
  const shouldLimitRequestsForE2E =
    getShouldLimitRequestsForE2E(!!e2eLimitRequests);

  const aggregatorInstitutionSyncer = createAggregatorInstitutionSyncer({
    aggregatorName: "mx",
    fetchAndConvertInstitutionPage,
    minimumValidInstitutionCount: shouldLimitRequestsForE2E ? 1 : 10000,
  });

  await aggregatorInstitutionSyncer({ e2eLimitRequests });
};
