import React from "react";
import { ByInstitution } from "./ByInstitution";
import {
  render,
  screen,
  userEvent,
  waitForLoad,
} from "../../../shared/test/testUtils";
import { server } from "../../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTIONS_WITH_PERFORMANCE_URL } from "../api";
import { institutionsWithPerformanceTestResponse } from "../../../shared/test/testData/institutionsWithPerformance";
import { BY_INSTITUTION_NAME_TABLE_HEADER_TEXT } from "./constants";

const mockInstitutionsWithPerformanceResponseWithName = (name: string) => {
  return HttpResponse.json({
    ...institutionsWithPerformanceTestResponse,
    institutions: [
      { ...institutionsWithPerformanceTestResponse.institutions[0], name },
    ],
  });
};

const expectInstitutionName = async (name: string) => {
  expect(await screen.findByText(name)).toBeInTheDocument();
};

describe("<ByInstitution />", () => {
  it("sorts by name ascending by default and switches the sort order back and forth", async () => {
    const nameAscendingInstitutionName = "name ascending";
    const nameDescendingInstitutionName = "name descending";

    server.use(
      http.get(INSTITUTIONS_WITH_PERFORMANCE_URL, ({ request }) => {
        const { searchParams } = new URL(request.url);

        if (searchParams.get("sortBy") === "name:desc") {
          return mockInstitutionsWithPerformanceResponseWithName(
            nameDescendingInstitutionName,
          );
        }

        return mockInstitutionsWithPerformanceResponseWithName(
          nameAscendingInstitutionName,
        );
      }),
    );

    render(<ByInstitution />);

    await waitForLoad();

    await expectInstitutionName(nameAscendingInstitutionName);

    await userEvent.click(
      screen.getByText(BY_INSTITUTION_NAME_TABLE_HEADER_TEXT),
    );

    await expectInstitutionName(nameDescendingInstitutionName);

    await userEvent.click(
      screen.getByText(BY_INSTITUTION_NAME_TABLE_HEADER_TEXT),
    );

    await expectInstitutionName(nameAscendingInstitutionName);
  });

  it("goes back to page 1 if search changes", async () => {});

  it("timeFrame, and jobTypes", () => {});

  it("paginates, changes page size, and goes back to page 1 when page size changes", () => {});

  it("renders a loading skeleton when loading", () => {});

  it("renders an empty state when there are no institutions", () => {});

  it("renders an error state and allows retry", () => {});
});
