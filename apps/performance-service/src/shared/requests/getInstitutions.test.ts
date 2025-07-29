import { http, HttpResponse } from "msw";
import { server } from "../tests/testServer";
import { getInstitutions } from "./getInstitutions";
import { INSTITUTION_SERVICE_INSTITUTIONS_URL } from "../tests/handlers";
import { testInstitutionsResponse } from "../tests/testData/institutions";

describe("getInstitutions", () => {
  it("returns institution data and passes the correct parameters", async () => {
    let queryParams;

    const page = "1";
    const pageSize = "10";

    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, ({ request }) => {
        const { searchParams } = new URL(request.url);

        queryParams = Object.fromEntries(searchParams.entries());

        return HttpResponse.json(testInstitutionsResponse);
      }),
    );

    const institutions = await getInstitutions({
      page,
      pageSize,
    });

    expect(institutions).toEqual(testInstitutionsResponse.institutions);

    expect(queryParams).toEqual({
      page,
      pageSize,
      search: "",
    });
  });

  it("throws an error when the response is not ok", async () => {
    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, () =>
        HttpResponse.json({ error: "Not Found" }, { status: 404 }),
      ),
    );

    await expect(
      getInstitutions({ page: "1", pageSize: "10" }),
    ).rejects.toThrow("Not Found");
  });
});
