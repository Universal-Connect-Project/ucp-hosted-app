import React from "react";
import AggregatorSelect, { useAggregatorSelect } from "./AggregatorSelect";
import { render, screen, userEvent, waitForLoad } from "../../test/testUtils";
import { aggregatorsResponse } from "../../api/testData/aggregators";
import { AGGREGATORS_LABEL_TEXT } from "./constants";

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
