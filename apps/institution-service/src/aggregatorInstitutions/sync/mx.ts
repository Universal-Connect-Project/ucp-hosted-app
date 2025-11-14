import { getConfig } from "../../shared/environment";
import { createAggregatorInstitutionSyncer } from "./createAggregatorInstitutionSyncer";

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

const pageSize = 100;

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

const fetchAndConvertInstitutionPage = async ({ page }: { page: number }) => {
  const { MX_API_SECRET, MX_CLIENT_ID } = getConfig();

  const response = await fetch(
    `${FETCH_MX_INSTITUTIONS_URL}?page=${page}&records_per_page=${pageSize}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "Accept-Version": "v20250224",
        Authorization: `Basic ${btoa(`${MX_CLIENT_ID}:${MX_API_SECRET}`)}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch institutions from MX: ${response.statusText}`,
    );
  }

  const {
    pagination: { total_pages },
    institutions,
  } = (await response.json()) as MXInstitutionsResponse;

  const nonHiddenInstitutions = institutions.filter(
    (institution) => !institution.is_hidden,
  );

  const convertedInstitutions = nonHiddenInstitutions.map(mapMXInstitution);

  return {
    convertedInstitutions,
    totalPages: total_pages,
  };
};

export const syncMXInstitutions = async () => {
  const aggregatorInstitutionSyncer = createAggregatorInstitutionSyncer({
    aggregatorName: "mx",
    fetchAndConvertInstitutionPage,
    minimumValidInstitutionCount: 10000,
  });

  await aggregatorInstitutionSyncer();
};
