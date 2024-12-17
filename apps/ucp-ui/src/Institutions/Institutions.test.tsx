import React from "react";
import {
  expectLocation,
  expectSkeletonLoader,
  render,
  screen,
  userEvent,
  waitForLoad,
  within,
} from "../shared/test/testUtils";
import Institutions from "./Institutions";
import {
  INSTITUTIONS_AGGREGATOR_INFO_ICON,
  INSTITUTIONS_AGGREGATOR_INFO_TOOLTIP,
  INSTITUTIONS_EMPTY_RESULTS_TEXT,
  INSTITUTIONS_ERROR_TEXT,
  INSTITUTIONS_FILTER_INCLUDE_INACTIVE_INTEGRATIONS_LABEL_TEXT,
  INSTITUTIONS_PERMISSIONS_ERROR_TEXT,
  INSTITUTIONS_ROW_TEST_ID,
  INSTITUTIONS_TABLE_INSTITUTION_HEADER_TITLE,
  INSTITUTIONS_TABLE_ROW_ROOT_CLASS,
  INSTITUTIONS_TABLE_SORT_ARROW_CLASS_DOWN,
  INSTITUTIONS_TABLE_SORT_ARROW_CLASS_UP,
  INSTITUTITIONS_ROW_AGGREGATOR_CHIP_TEST_ID,
} from "./constants";
import {
  institutions,
  institutionsBiggerPage,
  institutionsPage1,
  institutionsPage2,
  testInstitution,
  testInstitutionActiveAndInactive,
  testInstitutionNoAggregatorIntegrations,
} from "./testData/institutions";
import { server } from "../shared/test/testServer";
import { delay, http, HttpResponse } from "msw";
import {
  INSTITUTION_SERVICE_INSTITUTIONS_URL,
  INSTITUTION_SERVICE_PERMISSIONS_URL,
} from "./api";
import { institutionPermissionsResponse } from "../shared/test/testData/institution";
import { TRY_AGAIN_BUTTON_TEXT } from "../shared/components/constants";
import { INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT } from "./ChangeInstitution/constants";
import { institutionRoute } from "../shared/constants/routes";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";

const findRowById = async (id: string) => {
  expect(
    await screen.findByTestId(`${INSTITUTIONS_ROW_TEST_ID}-${id}`),
  ).toBeInTheDocument();
};

describe("<Institutions />", () => {
  it("shows an error on permissions load failure and allows retry", async () => {
    server.use(
      http.get(
        INSTITUTION_SERVICE_PERMISSIONS_URL,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(<Institutions />);

    expect(
      await screen.findByText(INSTITUTIONS_PERMISSIONS_ERROR_TEXT),
    ).toBeInTheDocument();

    server.use(
      http.get(INSTITUTION_SERVICE_PERMISSIONS_URL, () =>
        HttpResponse.json(institutionPermissionsResponse),
      ),
    );

    await userEvent.click(await screen.findByText(TRY_AGAIN_BUTTON_TEXT));

    expect(
      await screen.findByRole("button", {
        name: INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
      }),
    ).toBeInTheDocument();
  });

  it("renders a none chip if an institution is missing aggregatorIntegrations", async () => {
    render(<Institutions />);

    const rowWithNoAggregatorIntegrations = await screen.findByTestId(
      `${INSTITUTIONS_ROW_TEST_ID}-${testInstitutionNoAggregatorIntegrations.id}`,
    );

    expect(
      within(rowWithNoAggregatorIntegrations).getByText("None"),
    ).toBeInTheDocument();
  });

  it("sorts the aggregators by their displayName, shows the number of supported job types, and the job types", async () => {
    expect(
      testInstitution.aggregatorIntegrations[0].aggregator.displayName,
    ).toEqual("Sophtron");
    expect(
      testInstitution.aggregatorIntegrations[1].aggregator.displayName,
    ).toEqual("MX");

    render(<Institutions />);

    const rowWithTestInstitution = await screen.findByTestId(
      `${INSTITUTIONS_ROW_TEST_ID}-${testInstitution.id}`,
    );

    const [mxChip, sophtronChip] = within(
      rowWithTestInstitution,
    ).getAllByTestId(new RegExp(INSTITUTITIONS_ROW_AGGREGATOR_CHIP_TEST_ID));

    expect(within(mxChip).getByText(4)).toBeInTheDocument();
    expect(within(mxChip).getByText("MX")).toBeInTheDocument();

    await userEvent.hover(mxChip);

    expect(
      await screen.findByText(
        "Supported job types: Aggregation, Full History, Identification, Verification",
      ),
    );

    expect(within(sophtronChip).getByText(3)).toBeInTheDocument();
    expect(within(sophtronChip).getByText("Sophtron")).toBeInTheDocument();
  });

  it("renders the name of the institution and the ucp id", async () => {
    render(<Institutions />);

    expect(await screen.findByText(testInstitution.id)).toBeInTheDocument();
    expect(await screen.findByText(testInstitution.name)).toBeInTheDocument();
  });

  it("shows a loading state with skeletons before data arrives and while paginating", async () => {
    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, async () => {
        await delay();

        return HttpResponse.json(institutionsPage1);
      }),
    );

    render(<Institutions />);

    await expectSkeletonLoader();

    await waitForLoad();

    await userEvent.click(screen.getByText("2"));

    await expectSkeletonLoader();

    await waitForLoad();
  });

  it("shows an error on institutions failure and allow retry", async () => {
    server.use(
      http.get(
        INSTITUTION_SERVICE_INSTITUTIONS_URL,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(<Institutions />);

    expect(
      await screen.findByText(INSTITUTIONS_ERROR_TEXT),
    ).toBeInTheDocument();

    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, () =>
        HttpResponse.json(institutionsPage1),
      ),
    );

    await userEvent.click(screen.getByText(TRY_AGAIN_BUTTON_TEXT));

    await findRowById(institutionsPage1.institutions[0].id);
  });

  it("paginates, changes the number of rows, and resets the page back to 1 on filter change", async () => {
    const institutionsFilteredBySupportsAggregation = {
      ...institutionsBiggerPage,
      institutions: [
        {
          ...institutionsBiggerPage.institutions[0],
          id: "filteredBySupportsAggregation",
        },
      ],
    };

    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, ({ request }) => {
        let response = institutionsPage1;

        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") as string, 10);
        const pageSize = parseInt(searchParams.get("pageSize") as string, 10);
        const supportsAggregation =
          searchParams.get("supportsAggregation") === "true";

        if (page === 2) {
          response = institutionsPage2;
        } else if (pageSize === 25) {
          if (page === 1) {
            if (supportsAggregation) {
              response = institutionsFilteredBySupportsAggregation;
            } else {
              response = institutionsBiggerPage;
            }
          }
        }

        return HttpResponse.json(response);
      }),
    );

    render(<Institutions />);

    await findRowById(institutionsPage1.institutions[0].id);

    await userEvent.click(screen.getByText(2));

    await findRowById(institutionsPage2.institutions[0].id);

    await userEvent.click(screen.getByText(10));
    await userEvent.click(screen.getByText(25));

    await findRowById(institutionsBiggerPage.institutions[0].id);

    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.aggregation.displayName),
    );

    await findRowById(
      institutionsFilteredBySupportsAggregation.institutions[0].id,
    );
  });

  it("shows a tooltip for aggregators", async () => {
    render(<Institutions />);

    await userEvent.hover(
      await screen.findByTestId(INSTITUTIONS_AGGREGATOR_INFO_ICON),
    );

    expect(
      await screen.findByText(INSTITUTIONS_AGGREGATOR_INFO_TOOLTIP),
    ).toBeInTheDocument();
  });

  it("navigates to an institution when clicking on a row", async () => {
    render(<Institutions />);

    await waitForLoad();

    await userEvent.click(
      screen.getAllByTestId(new RegExp(INSTITUTIONS_ROW_TEST_ID))[0],
    );

    expectLocation(
      institutionRoute.createPath({ institutionId: institutions[0].id }),
    );
  });

  it("hides inactive integrations when includeInactiveIntegrations is off, but shows them when it's on", async () => {
    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, () =>
        HttpResponse.json({
          ...institutionsPage1,
          institutions: [testInstitutionActiveAndInactive],
        }),
      ),
    );
    render(<Institutions />);

    const inactiveDisplayName =
      testInstitutionActiveAndInactive.aggregatorIntegrations[1].aggregator
        .displayName;

    expect(await screen.findAllByText(inactiveDisplayName)).toHaveLength(1);

    await userEvent.click(
      screen.getByLabelText(
        INSTITUTIONS_FILTER_INCLUDE_INACTIVE_INTEGRATIONS_LABEL_TEXT,
      ),
    );

    expect(await screen.findAllByText(inactiveDisplayName)).toHaveLength(2);
  });

  it("shows an empty state if there are no results", async () => {
    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, () =>
        HttpResponse.json({
          ...institutionsPage1,
          institutions: [],
        }),
      ),
    );

    render(<Institutions />);

    expect(
      await screen.findByText(INSTITUTIONS_EMPTY_RESULTS_TEXT),
    ).toBeInTheDocument();
  });

  it("initially shows no arrows, then shows down arrow when the first column is clicked, and then up arrow when it's clicked again", async () => {
    const { container } = render(<Institutions />);

    await waitForLoad();

    expect(
      container.querySelector(
        `.Mui-active ${INSTITUTIONS_TABLE_SORT_ARROW_CLASS_UP}`,
      ),
    ).not.toBeInTheDocument();

    expect(
      container.querySelector(
        `.Mui-active ${INSTITUTIONS_TABLE_SORT_ARROW_CLASS_DOWN}`,
      ),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByText(INSTITUTIONS_TABLE_INSTITUTION_HEADER_TITLE),
    );

    expect(
      container.querySelector(INSTITUTIONS_TABLE_SORT_ARROW_CLASS_DOWN),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByText(INSTITUTIONS_TABLE_INSTITUTION_HEADER_TITLE),
    );

    expect(
      container.querySelector(INSTITUTIONS_TABLE_SORT_ARROW_CLASS_UP),
    ).toBeInTheDocument();
  });

  it("sorts correctly when headers are clicked", async () => {
    const testSortList = [
      {
        ...testInstitution,
        id: "9e7eaf0f-f3dc-4bd8-97b3-e09d85dcd0fa",
        name: "AA Bank",
      },
      {
        ...testInstitution,
        id: "a47eca28-8929-410f-8f7e-317c9678110c",
        name: "ZZ Bank",
      },
    ];

    const { container } = render(<Institutions />);

    await waitForLoad();

    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, () =>
        HttpResponse.json({
          ...institutionsPage1,
          institutions: [...testSortList],
        }),
      ),
    );

    await userEvent.click(
      screen.getByText(INSTITUTIONS_TABLE_INSTITUTION_HEADER_TITLE),
    );

    await waitForLoad();

    expect(
      container?.querySelector(INSTITUTIONS_TABLE_ROW_ROOT_CLASS)?.children[1], // Second cell
    ).toHaveTextContent(testSortList[0].id);

    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, () =>
        HttpResponse.json({
          ...institutionsPage1,
          institutions: [...testSortList].reverse(),
        }),
      ),
    );

    await userEvent.click(
      screen.getByText(INSTITUTIONS_TABLE_INSTITUTION_HEADER_TITLE),
    );

    await waitForLoad();

    expect(
      container?.querySelector(INSTITUTIONS_TABLE_ROW_ROOT_CLASS)?.children[1], // Second cell
    ).toHaveTextContent(testSortList[1].id);
  });
});
