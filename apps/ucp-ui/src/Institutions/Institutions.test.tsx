import React from "react";
import {
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
  INSTITUTIONS_ERROR_TEXT,
  INSTITUTIONS_PERMISSIONS_ERROR_TEXT,
  INSTITUTIONS_ROW_TEST_ID,
  INSTITUTITIONS_ROW_AGGREGATOR_CHIP_TEST_ID,
} from "./constants";
import {
  institutionsBiggerPage,
  institutionsPage1,
  institutionsPage2,
  testInstitution,
} from "./testData/institutions";
import { server } from "../shared/test/testServer";
import { http, HttpResponse } from "msw";
import {
  INSTITUTION_SERVICE_INSTITUTIONS_URL,
  INSTITUTION_SERVICE_PERMISSIONS_URL,
} from "./api";
import { institutionPermissionsResponse } from "../shared/test/testData/institution";
import { TRY_AGAIN_BUTTON_TEXT } from "../shared/components/constants";
import { INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT } from "./ChangeInstitution/constants";

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

  it("paginates and changes number of rows", async () => {
    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, ({ request }) => {
        let response = institutionsPage1;

        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") as string, 10);
        const pageSize = parseInt(searchParams.get("pageSize") as string, 10);

        if (page === 2) {
          response = institutionsPage2;
        } else if (pageSize === 25) {
          response = institutionsBiggerPage;
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
});
