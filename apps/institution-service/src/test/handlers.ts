import { http, HttpResponse } from "msw";
import {
  finicityAccessToken,
  finicityInstitutionsPage1,
  finicityInstitutionsPage2,
} from "./testData/finicityInstitutions";
import {
  FETCH_FINICITY_ACCESS_TOKEN_URL,
  FETCH_FINICITY_INSTITUTIONS_URL,
} from "../institutionSyncing/finicity";

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
];
