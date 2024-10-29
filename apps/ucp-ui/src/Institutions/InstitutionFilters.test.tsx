import React from "react";
import { render, screen, userEvent, waitFor } from "../shared/test/testUtils";
import { jobTypeCheckboxes } from "./InstitutionFilters";
import { aggregatorsResponse } from "../shared/api/testData/aggregators";
import Institutions from "./Institutions";
import { server } from "../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_INSTITUTIONS_URL } from "./api";
import { institutionsPage1 } from "./testData/institutions";
import {
  INSTITUTIONS_FILTER_INCLUDE_INACTIVE_INTEGRATIONS_LABEL_TEXT,
  INSTITUTIONS_FILTER_OAUTH_LABEL_TEXT,
  INSTITUTIONS_FILTER_SEARCH_LABEL_TEXT,
} from "./constants";

const { aggregators } = aggregatorsResponse;

describe("<InstitutionFilters />", () => {
  it("renders a checkbox for each of the aggregators", async () => {
    render(<Institutions />);

    expect(
      await screen.findByText(aggregators[0].displayName),
    ).toBeInTheDocument();

    aggregators.forEach(({ displayName }) =>
      expect(screen.getByLabelText(displayName)).toBeInTheDocument(),
    );
  });

  it("updates the query for each of the inputs including removing an aggregator and delays search changes", async () => {
    let latestSearchParams: Record<string, string> = {};
    let latestAggregatorNames;
    const expectedParams: Record<string, string> = {
      includeInactiveIntegrations: "false",
      search: "",
      supportsHistory: "false",
      supportsIdentification: "false",
      supportsOauth: "false",
      supportsVerification: "false",
    };
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

    const [firstAggregator] = aggregators;

    await userEvent.click(screen.getByLabelText(firstAggregator.displayName));

    expectedAggregatorNames.splice(
      expectedAggregatorNames.findIndex(
        (name) => firstAggregator.name === name,
      ),
      1,
    );

    expect(latestAggregatorNames).toEqual(expectedAggregatorNames);

    for (const jobType of jobTypeCheckboxes) {
      await userEvent.click(screen.getByLabelText(jobType.label));

      expectedParams[jobType.prop] = "true";

      expect(latestSearchParams).toEqual(expectedParams);
    }

    await userEvent.click(
      screen.getByLabelText(INSTITUTIONS_FILTER_OAUTH_LABEL_TEXT),
    );

    expectedParams.supportsOauth = "true";

    expect(latestSearchParams).toEqual(expectedParams);

    await userEvent.click(
      screen.getByLabelText(
        INSTITUTIONS_FILTER_INCLUDE_INACTIVE_INTEGRATIONS_LABEL_TEXT,
      ),
    );

    expectedParams.includeInactiveIntegrations = "true";

    expect(latestSearchParams).toEqual(expectedParams);

    const testSearch = "testSearch";

    await userEvent.type(
      screen.getByLabelText(INSTITUTIONS_FILTER_SEARCH_LABEL_TEXT),
      testSearch,
    );

    expect(latestSearchParams).toEqual(expectedParams);

    expectedParams.search = testSearch;

    await waitFor(() => expect(latestSearchParams).toEqual(expectedParams));

    expect(Object.keys(latestSearchParams || {})).toHaveLength(
      jobTypeCheckboxes.length + 3,
    );
    expect(latestAggregatorNames).toHaveLength(aggregators.length - 1);
  });
});
