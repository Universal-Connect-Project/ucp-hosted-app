import { getConfig } from "../shared/environment";
import { AggregatorInstitution } from "./const";

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

const fetchInstitutionPage = async ({
  page,
  token,
}: {
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

  const data = (await response.json()) as FinicityInstitutionsResponse;
  return data;
};

export const mapFinicityInstitution = (
  institution: FinicityInstitution,
): AggregatorInstitution => ({
  aggregatorInstitutionId: institution.id.toString(),
  supportsOAuth: institution.oauthEnabled,
  supportsIdentification: institution.accountOwner,
  supportsVerification: institution.ach,
  supportsAggregation: institution.transAgg,
  supportsHistory: institution.aha,
  supportsRewards: false,
  supportsBalance: institution.availBalance,
});

export const fetchFinicityInstitutions = async () => {
  const token = await fetchAccessToken();

  const page1 = await fetchInstitutionPage({ page: 1, token });
  const { found, institutions: page1Institutions } = page1;

  const institutions = [...page1Institutions];

  const numberOfPages = Math.ceil(found / pageSize);

  for (let page = 2; page < numberOfPages + 1; page++) {
    const { institutions: currentPageInstitutions } =
      await fetchInstitutionPage({ page, token });

    institutions.push(...currentPageInstitutions);
  }

  return institutions.map(mapFinicityInstitution);
};
