import { INSTITUTION_SERVICE_URL } from "../environment";
import { getPerformanceServiceAccessToken } from "../utils/getPerformanceServiceAccessToken";

interface InstitutionsResponse {}

export const getInstitutions = async ({
  page,
  pageSize,
  search,
}: {
  page: string;
  pageSize: string;
  search?: string;
}): Promise<InstitutionsResponse> => {
  const token = await getPerformanceServiceAccessToken();

  const url = new URL(
    `${INSTITUTION_SERVICE_URL}/performanceAuth/institutions`,
  );

  url.search = new URLSearchParams({
    includeInactiveIntegrations: "true",
    page,
    pageSize,
    search: search || "",
  }).toString();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const errorData: { error: string } = await response.json();

    throw new Error(errorData.error);
  }

  return (await response.json()) as InstitutionsResponse;
};
