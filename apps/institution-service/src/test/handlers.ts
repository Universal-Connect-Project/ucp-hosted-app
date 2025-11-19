import { http, HttpResponse } from "msw";
import {
  finicityAccessToken,
  finicityInstitutionsPage1,
  finicityInstitutionsPage2,
} from "./testData/finicityInstitutions";
import {
  FETCH_FINICITY_ACCESS_TOKEN_URL,
  FETCH_FINICITY_INSTITUTIONS_URL,
} from "../aggregatorInstitutions/sync/finicity";
import { FETCH_MX_INSTITUTIONS_URL } from "../aggregatorInstitutions/sync/mx";
import {
  mxInstitutionsPage1,
  mxInstitutionsPage1Limited,
  mxInstitutionsPage2,
  mxInstitutionsPage2Limited,
} from "./testData/mxInstitutions";

export const handlers = [
  http.post(FETCH_FINICITY_ACCESS_TOKEN_URL, () =>
    HttpResponse.json(finicityAccessToken),
  ),
  http.get(FETCH_FINICITY_INSTITUTIONS_URL, ({ request }) => {
    const url = new URL(request.url);
    const start = url.searchParams.get("start");

    if (start === "2") {
      return HttpResponse.json(finicityInstitutionsPage2);
    }

    return HttpResponse.json(finicityInstitutionsPage1);
  }),
  http.get(FETCH_MX_INSTITUTIONS_URL, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get("page");
    const recordsPerPage = url.searchParams.get("records_per_page");
    const name = url.searchParams.get("name");

    if (recordsPerPage === "60" && name === "capital") {
      if (page === "2") {
        return HttpResponse.json(mxInstitutionsPage2Limited);
      }

      return HttpResponse.json(mxInstitutionsPage1Limited);
    }

    if (recordsPerPage === "100" && name === null) {
      if (page === "2") {
        return HttpResponse.json(mxInstitutionsPage2);
      }

      return HttpResponse.json(mxInstitutionsPage1);
    }
  }),
];
