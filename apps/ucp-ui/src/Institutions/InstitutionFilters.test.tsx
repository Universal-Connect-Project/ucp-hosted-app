import React from "react";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";
import { render, screen, userEvent } from "../shared/test/testUtils";
import { createStore } from "../store";
import InstitutionFilters, { jobTypeCheckboxes } from "./InstitutionFilters";
import { aggregatorsResponse } from "../shared/api/testData/aggregators";
import Institutions from "./Institutions";
import { server } from "../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_INSTITUTIONS_URL } from "./api";
import { institutionsPage1 } from "./testData/institutions";

const { aggregators } = aggregatorsResponse;

describe("<InstitutionFilters />", () => {
  it("resets the filters on unmount", async () => {
    const store = createStore();

    const { unmount } = render(<InstitutionFilters />, {
      store,
    });

    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.aggregation.displayName),
    );

    expect(store.getState().institutionFilter.supportsAggregation).toBe(true);

    unmount();

    expect(store.getState().institutionFilter.supportsAggregation).toBe(
      undefined,
    );
  });

  it("renders a checkbox for each of the aggregators", async () => {
    render(<InstitutionFilters />);

    expect(
      await screen.findByText(aggregators[0].displayName),
    ).toBeInTheDocument();

    aggregators.forEach(({ displayName }) =>
      expect(screen.getByLabelText(displayName)).toBeInTheDocument(),
    );
  });

  it("updates the query for each of the inputs", async () => {
    let latestSearchParams;
    let latestAggregatorNames;
    const expectedParams: Record<string, string> = {};
    const expectedAggregatorNames = [];

    server.use(
      http.get(INSTITUTION_SERVICE_INSTITUTIONS_URL, ({ request }) => {
        const searchParams = new URL(request.url).searchParams;
        latestSearchParams = Object.fromEntries(searchParams.entries());

        delete latestSearchParams.aggregatorName;
        delete latestSearchParams.pageSize;
        delete latestSearchParams.page;

        latestAggregatorNames = searchParams.getAll("aggregatorName");

        return HttpResponse.json(institutionsPage1);
      }),
    );

    render(<Institutions />);

    expect(
      await screen.findByText(aggregators[0].displayName),
    ).toBeInTheDocument();

    for (const aggregator of aggregators) {
      await userEvent.click(screen.getByLabelText(aggregator.displayName));

      expectedAggregatorNames.push(aggregator.name);

      expect(latestAggregatorNames).toEqual(expectedAggregatorNames);
    }

    for (const jobType of jobTypeCheckboxes) {
      await userEvent.click(screen.getByLabelText(jobType.label));

      expectedParams[jobType.prop] = "true";

      expect(latestSearchParams).toEqual(expectedParams);
    }

    await userEvent.click(screen.getByLabelText("OAuth"));

    expectedParams.supportsOauth = "true";

    expect(latestSearchParams).toEqual(expectedParams);

    await userEvent.click(
      screen.getByLabelText("Include inactive integrations"),
    );

    expectedParams.includeInactiveIntegrations = "true";

    expect(latestSearchParams).toEqual(expectedParams);

    expect(Object.keys(latestSearchParams || {})).toHaveLength(
      jobTypeCheckboxes.length + 2,
    );
    expect(latestAggregatorNames).toHaveLength(aggregators.length);
  });
});
