import React from "react";
import { ByInstitution } from "./ByInstitution";
import {
  expectSkeletonLoader,
  render,
  screen,
  userEvent,
  waitForLoad,
} from "../../../shared/test/testUtils";
import { server } from "../../../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTIONS_WITH_PERFORMANCE_URL } from "../api";
import { institutionsWithPerformanceTestResponse } from "../../../shared/test/testData/institutionsWithPerformance";
import {
  BY_INSTITUTION_INSTITUTIONS_EMPTY_RESULTS_TEXT,
  BY_INSTITUTION_INSTITUTIONS_ERROR_TEXT,
  BY_INSTITUTION_NAME_TABLE_HEADER_TEXT,
  BY_INSTITUTION_SEARCH_LABEL_TEXT,
} from "./constants";
import { supportsJobTypeMap } from "../../../shared/constants/jobTypes";
import {
  JOB_TYPES_LABEL_TEXT,
  oneHundredEightyDaysOption,
  thirtyDaysOption,
  TIME_FRAME_LABEL_TEXT,
} from "../../../shared/components/Forms/constants";
import { TRY_AGAIN_BUTTON_TEXT } from "../../../shared/components/constants";

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

  it("filters by search and goes back to page 1 if search changes", async () => {
    const page1InstitutionName = "page 1 institution";
    const page2InstitutionName = "page 2 institution";
    const page1WithSearchInstitutionName = "page 1 with search institution";

    const searchText = "search text";

    server.use(
      http.get(INSTITUTIONS_WITH_PERFORMANCE_URL, ({ request }) => {
        const { searchParams } = new URL(request.url);

        if (searchParams.get("page") === "2") {
          return mockInstitutionsWithPerformanceResponseWithName(
            page2InstitutionName,
          );
        }

        if (
          searchParams.get("search") === searchText &&
          searchParams.get("page") === "1"
        ) {
          return mockInstitutionsWithPerformanceResponseWithName(
            page1WithSearchInstitutionName,
          );
        }

        if (searchParams.get("page") === "1") {
          return mockInstitutionsWithPerformanceResponseWithName(
            page1InstitutionName,
          );
        }
      }),
    );

    render(<ByInstitution />);

    await expectInstitutionName(page1InstitutionName);

    await userEvent.click(await screen.findByText("2"));

    await expectInstitutionName(page2InstitutionName);

    await userEvent.type(
      screen.getByLabelText(BY_INSTITUTION_SEARCH_LABEL_TEXT),
      searchText,
    );

    await expectInstitutionName(page1WithSearchInstitutionName);
  });

  it("filters by timeFrame, and jobTypes", async () => {
    const oneHundredEightyDaysInstitutionName = "180 days institution";
    const thirtyDaysInstitutionName = "30 days institution";
    const oneHundredEightyDaysAndAccountOwnerInstitutionName =
      "180 days and account owner institution";

    server.use(
      http.get(INSTITUTIONS_WITH_PERFORMANCE_URL, ({ request }) => {
        const { searchParams } = new URL(request.url);

        if (
          searchParams.get("jobTypes") === "accountOwner" &&
          searchParams.get("timeFrame") === oneHundredEightyDaysOption.value
        ) {
          return mockInstitutionsWithPerformanceResponseWithName(
            oneHundredEightyDaysAndAccountOwnerInstitutionName,
          );
        }

        if (
          searchParams.get("timeFrame") === oneHundredEightyDaysOption.value
        ) {
          return mockInstitutionsWithPerformanceResponseWithName(
            oneHundredEightyDaysInstitutionName,
          );
        }

        if (searchParams.get("timeFrame") === thirtyDaysOption.value) {
          return mockInstitutionsWithPerformanceResponseWithName(
            thirtyDaysInstitutionName,
          );
        }
      }),
    );

    render(<ByInstitution />);

    await expectInstitutionName(thirtyDaysInstitutionName);

    await userEvent.click(
      screen.getByRole("combobox", { name: TIME_FRAME_LABEL_TEXT }),
    );

    await userEvent.click(
      screen.getByRole("option", { name: oneHundredEightyDaysOption.label }),
    );

    await expectInstitutionName(oneHundredEightyDaysInstitutionName);

    await userEvent.click(
      screen.getByRole("combobox", { name: JOB_TYPES_LABEL_TEXT }),
    );

    await userEvent.click(
      screen.getByRole("option", {
        name: supportsJobTypeMap.accountOwner.displayName,
      }),
    );

    await expectInstitutionName(
      oneHundredEightyDaysAndAccountOwnerInstitutionName,
    );
  });

  it("paginates, changes page size, and goes back to page 1 when page size changes", async () => {
    const page1InstitutionName = "page 1 institution";
    const page2InstitutionName = "page 2 institution";
    const page1With50PageSizeInstitutionName =
      "page 1 with 50 page size institution";

    server.use(
      http.get(INSTITUTIONS_WITH_PERFORMANCE_URL, ({ request }) => {
        const { searchParams } = new URL(request.url);

        if (searchParams.get("page") === "2") {
          return mockInstitutionsWithPerformanceResponseWithName(
            page2InstitutionName,
          );
        }

        if (
          searchParams.get("page") === "1" &&
          searchParams.get("pageSize") === "50"
        ) {
          return mockInstitutionsWithPerformanceResponseWithName(
            page1With50PageSizeInstitutionName,
          );
        }

        if (searchParams.get("page") === "1") {
          return mockInstitutionsWithPerformanceResponseWithName(
            page1InstitutionName,
          );
        }
      }),
    );

    render(<ByInstitution />);

    await expectInstitutionName(page1InstitutionName);

    await userEvent.click(screen.getByText("2"));

    await expectInstitutionName(page2InstitutionName);

    await userEvent.click(
      screen.getByRole("combobox", { name: "Rows per page:" }),
    );

    await userEvent.click(screen.getByRole("option", { name: "50" }));

    await expectInstitutionName(page1With50PageSizeInstitutionName);
  });

  it("renders a loading skeleton when loading", async () => {
    render(<ByInstitution />);

    await expectSkeletonLoader();
  });

  it("renders an empty state when there are no institutions", async () => {
    server.use(
      http.get(INSTITUTIONS_WITH_PERFORMANCE_URL, () =>
        HttpResponse.json({
          ...institutionsWithPerformanceTestResponse,
          institutions: [],
        }),
      ),
    );

    render(<ByInstitution />);

    expect(
      await screen.findByText(BY_INSTITUTION_INSTITUTIONS_EMPTY_RESULTS_TEXT),
    ).toBeInTheDocument();
  });

  it("renders an error state and allows retry", async () => {
    server.use(
      http.get(
        INSTITUTIONS_WITH_PERFORMANCE_URL,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    render(<ByInstitution />);

    expect(
      await screen.findByText(BY_INSTITUTION_INSTITUTIONS_ERROR_TEXT),
    ).toBeInTheDocument();

    server.use(
      http.get(INSTITUTIONS_WITH_PERFORMANCE_URL, () =>
        HttpResponse.json(institutionsWithPerformanceTestResponse),
      ),
    );

    await userEvent.click(
      screen.getByRole("button", { name: TRY_AGAIN_BUTTON_TEXT }),
    );

    await expectInstitutionName(
      institutionsWithPerformanceTestResponse.institutions[0].name,
    );
  });
});
