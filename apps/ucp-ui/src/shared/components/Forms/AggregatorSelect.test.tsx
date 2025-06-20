import React from "react";
import AggregatorSelect, { useAggregatorSelect } from "./AggregatorSelect";
import {
  render,
  screen,
  userEvent,
  waitFor,
  waitForLoad,
} from "../../test/testUtils";
import { aggregatorsResponse } from "../../api/testData/aggregators";
import { AGGREGATORS_ERROR_TEXT, AGGREGATORS_LABEL_TEXT } from "./constants";
import { server } from "../../test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_AGGREGATORS_URL } from "../../api/aggregators";
import { TRY_AGAIN_BUTTON_TEXT } from "../constants";

const { aggregators } = aggregatorsResponse;

const clickOutsideTestId = "clickOutsideTestId";

const TestComponent = () => {
  const { aggregators, handleAggregatorsChange } = useAggregatorSelect();

  return (
    <>
      <div data-testid={clickOutsideTestId} />
      <AggregatorSelect
        onChange={handleAggregatorsChange}
        value={aggregators}
      />
    </>
  );
};

describe("<AggregatorSelect />", () => {
  it("shows an error state, disables the input, and allows retry", async () => {
    server.use(
      http.get(
        INSTITUTION_SERVICE_AGGREGATORS_URL,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(<TestComponent />);

    expect(await screen.findByText(AGGREGATORS_ERROR_TEXT)).toBeInTheDocument();
    expect(screen.queryByLabelText(AGGREGATORS_LABEL_TEXT)).toBeDisabled();

    server.use(
      http.get(INSTITUTION_SERVICE_AGGREGATORS_URL, () =>
        HttpResponse.json(aggregatorsResponse),
      ),
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: TRY_AGAIN_BUTTON_TEXT,
      }),
    );

    await waitFor(() =>
      expect(screen.getByLabelText(AGGREGATORS_LABEL_TEXT)).not.toBeDisabled(),
    );
    expect(screen.queryByText(AGGREGATORS_ERROR_TEXT)).not.toBeInTheDocument();
  });

  it("defaults to no aggregators selected and allows selecting multiple aggregators", async () => {
    render(<TestComponent />);

    await waitForLoad();

    aggregators.forEach(({ displayName }) => {
      expect(screen.queryByText(displayName)).not.toBeInTheDocument();
    });

    await userEvent.click(await screen.findByLabelText(AGGREGATORS_LABEL_TEXT));

    for (const { displayName } of aggregators) {
      expect(
        await screen.findByRole("option", { name: displayName }),
      ).toBeInTheDocument();

      await userEvent.click(screen.getByRole("option", { name: displayName }));

      expect(await screen.findAllByText(new RegExp(displayName))).toHaveLength(
        2,
      );
    }
  });
});
