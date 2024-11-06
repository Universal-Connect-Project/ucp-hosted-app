import { PORT } from "shared/const";
import { SUPER_USER_ACCESS_TOKEN_ENV } from "../constants/accessTokens";
import { createAuthorizationHeader } from "./authorization";

export const getInstitutionsWithFiltersRequest = ({
  integrationFieldFilter,
  search,
  aggregatorFilter,
}: {
  integrationFieldFilter?: string[];
  search?: string;
  aggregatorFilter?: string[];
}) => {
  let integrationFilterQueryParam;
  if (integrationFieldFilter) {
    integrationFilterQueryParam = integrationFieldFilter
      .map((integrationField) => `${integrationField}=true&`)
      .join("");
  } else {
    integrationFilterQueryParam = "";
  }

  const searchQueryParam = search ? `search=${search}&` : "";

  let aggregatorFilterQueryParam;
  if (aggregatorFilter) {
    aggregatorFilterQueryParam = aggregatorFilter
      .map((aggregator) => `aggregatorName=${aggregator}`)
      .join("&");
  } else {
    aggregatorFilterQueryParam = "";
  }

  return cy.request({
    url: `http://localhost:${PORT}/institutions?pageSize=50&${integrationFilterQueryParam}${searchQueryParam}${aggregatorFilterQueryParam}`,
    method: "GET",
    headers: {
      Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
    },
  });
};
