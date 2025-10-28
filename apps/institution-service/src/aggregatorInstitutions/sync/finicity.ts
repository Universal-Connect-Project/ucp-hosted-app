import { getAggregatorByName } from "../../shared/aggregators/getAggregatorByName";
import { getConfig } from "../../shared/environment";
import { createOrUpdateAggregatorInstitution } from "./createOrUpdateAggregatorInstitution";
import { removeMissingAggregatorInstitutions } from "./utils";

export const FETCH_FINICITY_ACCESS_TOKEN_URL =
  "https://api.finicity.com/aggregation/v2/partners/authentication";

const fetchAccessToken = async () => {
  const { FINICITY_APP_KEY, FINICITY_PARTNER_ID, FINICITY_SECRET } =
    getConfig();

  if (!FINICITY_APP_KEY || !FINICITY_PARTNER_ID || !FINICITY_SECRET) {
    throw new Error("Missing Finicity environment variables");
  }

  const authResponse = await fetch(FETCH_FINICITY_ACCESS_TOKEN_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "finicity-app-key": FINICITY_APP_KEY,
    },
    body: JSON.stringify({
      partnerId: FINICITY_PARTNER_ID,
      partnerSecret: FINICITY_SECRET,
    }),
  });

  if (!authResponse.ok) {
    throw new Error(
      `Failed to authenticate with Finicity: ${authResponse.statusText}`,
    );
  }

  const { token } = (await authResponse.json()) as { token: string };

  return token;
};

interface FinicityInstitution {
  accountOwner: boolean;
  ach: boolean;
  aha: boolean;
  availBalance: boolean;
  id: number;
  name: string;
  oauthEnabled: boolean;
  transAgg: boolean;
  urlHomeApp: string;
}

interface FinicityInstitutionsResponse {
  found: number;
  institutions: FinicityInstitution[];
  page: number;
  pageSize: number;
}

const pageSize = 1000;

export const FETCH_FINICITY_INSTITUTIONS_URL =
  "https://api.finicity.com/institution/v2/institutions";

export const mapFinicityInstitution = (institution: FinicityInstitution) => ({
  id: institution.id.toString(),
  name: institution.name,
  supportsAccountOwner: institution.accountOwner,
  supportsAccountNumber: institution.ach,
  supportsBalance: institution.availBalance,
  supportsOAuth: institution.oauthEnabled,
  supportsRewards: false,
  supportsTransactions: institution.transAgg,
  supportsTransactionHistory: institution.aha,
  url: institution.urlHomeApp,
});

const fetchAndStoreInstitutionPage = async ({
  aggregatorId,
  page,
  token,
}: {
  aggregatorId: number;
  page: number;
  token: string;
}) => {
  const { FINICITY_APP_KEY } = getConfig();

  const response = await fetch(
    `${FETCH_FINICITY_INSTITUTIONS_URL}?start=${page}&limit=${pageSize}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "finicity-app-key": FINICITY_APP_KEY!,
        "finicity-app-token": token,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch institutions from Finicity: ${response.statusText}`,
    );
  }

  const { found, institutions } =
    (await response.json()) as FinicityInstitutionsResponse;

  for (const institution of institutions) {
    await createOrUpdateAggregatorInstitution({
      aggregatorId,
      ...mapFinicityInstitution(institution),
    });
  }

  const aggregatorInstitutionIds = institutions.map((inst) =>
    inst.id.toString(),
  );

  return { aggregatorInstitutionIds, totalInstitutionsCount: found };
};

export const syncFinicityInstitutions = async () => {
  const token = await fetchAccessToken();

  const aggregatorId = (await getAggregatorByName("finicity")).id;

  const firstPage = await fetchAndStoreInstitutionPage({
    aggregatorId,
    page: 1,
    token,
  });

  const { totalInstitutionsCount } = firstPage;

  const allAggregatorInstitutionIds = [...firstPage.aggregatorInstitutionIds];

  const numberOfPages = Math.ceil(totalInstitutionsCount / pageSize);

  for (let page = 2; page < numberOfPages + 1; page++) {
    const { aggregatorInstitutionIds } = await fetchAndStoreInstitutionPage({
      aggregatorId,
      page,
      token,
    });

    allAggregatorInstitutionIds.push(...aggregatorInstitutionIds);
  }

  await removeMissingAggregatorInstitutions({
    aggregatorId,
    aggregatorInstitutionIds: allAggregatorInstitutionIds,
    minimumValidInstitutionCount: 5000,
  });
};
