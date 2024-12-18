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
  INSTITUTIONS_FILTER_AGGREGATORS_ERROR_TEXT,
  INSTITUTIONS_FILTER_INCLUDE_INACTIVE_INTEGRATIONS_LABEL_TEXT,
  INSTITUTIONS_FILTER_OAUTH_LABEL_TEXT,
  INSTITUTIONS_FILTER_SEARCH_LABEL_TEXT,
} from "./constants";
import { INSTITUTION_SERVICE_AGGREGATORS_URL } from "../shared/api/aggregators";

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

  it("populates the inputs with filled inputs from the query string", async () => {
    const queryParams = {
      includeInactiveIntegrations: "true",
      search: "test",
      ...jobTypeCheckboxes.reduce(
        (acc, { prop }) => ({
          ...acc,
          [prop]: true,
        }),
        {},
      ),
      supportsOauth: "true",
      aggregatorName: aggregators.map(({ name }) => name).toString(),
    };

    render(<Institutions />, {
      initialRoute: `/?${new URLSearchParams(queryParams).toString()}`,
    });

    for (const { displayName } of aggregators) {
      expect(await screen.findByLabelText(displayName)).toBeChecked();
    }

    const labels = [
      INSTITUTIONS_FILTER_OAUTH_LABEL_TEXT,
      INSTITUTIONS_FILTER_INCLUDE_INACTIVE_INTEGRATIONS_LABEL_TEXT,
      ...jobTypeCheckboxes.map(({ label }) => label),
    ];

    for (const label of labels) {
      expect(screen.getByLabelText(label)).toBeChecked();
    }

    expect(
      screen.getByLabelText(INSTITUTIONS_FILTER_SEARCH_LABEL_TEXT),
    ).toHaveValue("test");
  });

  it("leaves the inputs blank if everything is falsy in the query string", async () => {
    const queryParams = {
      includeInactiveIntegrations: "false",
      search: "",
      ...jobTypeCheckboxes.reduce(
        (acc, { prop }) => ({
          ...acc,
          [prop]: "false",
        }),
        {},
      ),
      supportsOauth: "false",
      aggregatorName: [].toString(),
    };

    render(<Institutions />, {
      initialRoute: `/?${new URLSearchParams(queryParams).toString()}`,
    });

    for (const { displayName } of aggregators) {
      expect(await screen.findByLabelText(displayName)).not.toBeChecked();
    }

    const labels = [
      INSTITUTIONS_FILTER_OAUTH_LABEL_TEXT,
      INSTITUTIONS_FILTER_INCLUDE_INACTIVE_INTEGRATIONS_LABEL_TEXT,
      ...jobTypeCheckboxes.map(({ label }) => label),
    ];

    for (const label of labels) {
      expect(screen.getByLabelText(label)).not.toBeChecked();
    }

    expect(
      screen.getByLabelText(INSTITUTIONS_FILTER_SEARCH_LABEL_TEXT),
    ).toHaveValue("");
  });

  it("leaves the inputs blank if there's nothing in the query string", async () => {
    render(<Institutions />);

    for (const { displayName } of aggregators) {
      expect(await screen.findByLabelText(displayName)).not.toBeChecked();
    }

    const labels = [
      INSTITUTIONS_FILTER_OAUTH_LABEL_TEXT,
      INSTITUTIONS_FILTER_INCLUDE_INACTIVE_INTEGRATIONS_LABEL_TEXT,
      ...jobTypeCheckboxes.map(({ label }) => label),
    ];

    for (const label of labels) {
      expect(screen.getByLabelText(label)).not.toBeChecked();
    }

    expect(
      screen.getByLabelText(INSTITUTIONS_FILTER_SEARCH_LABEL_TEXT),
    ).toHaveValue("");
  });

  it("updates the query for each of the inputs including removing an aggregator and delays search changes", async () => {
    let latestSearchParams: Record<string, string> = {};
    let latestAggregatorNames;
    const expectedParams: Record<string, string> = {
      includeInactiveIntegrations: "false",
      search: "",
      ...jobTypeCheckboxes.reduce(
        (acc, { prop }) => ({
          ...acc,
          [prop]: "false",
        }),
        {},
      ),
      supportsOauth: "false",
      sortBy: "createdAt:desc",
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
      expectedAggregatorNames.indexOf(firstAggregator.name),
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
      jobTypeCheckboxes.length + 4,
    );
    expect(latestAggregatorNames).toHaveLength(aggregators.length - 1);
  });

  it("shows an error if fetch aggregators fails", async () => {
    server.use(
      http.get(
        INSTITUTION_SERVICE_AGGREGATORS_URL,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(<Institutions />);

    expect(
      await screen.findByText(INSTITUTIONS_FILTER_AGGREGATORS_ERROR_TEXT),
    ).toBeInTheDocument();
  });
});
