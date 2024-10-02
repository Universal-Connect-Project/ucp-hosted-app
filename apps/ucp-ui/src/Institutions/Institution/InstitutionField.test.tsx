import React from "react";
import InstitutionField from "./InstitutionField";
import {
  expectSkeletonLoader,
  render,
  screen,
  userEvent,
} from "../../shared/test/testUtils";

const name = "testName";
const value = "testValue";
const tooltip = "testTooltip";
const tooltipTestId = "tooltipTestId";

describe("<InstitutionField />", () => {
  it("renders the name, value, header tooltip, and value tooltip", async () => {
    render(
      <InstitutionField
        isLoading={false}
        name={name}
        tooltip={tooltip}
        tooltipTestId={tooltipTestId}
        value={value}
      />,
    );

    expect(screen.getByText(name)).toBeInTheDocument();
    expect(screen.getByText(value)).toBeInTheDocument();

    await userEvent.hover(screen.getByTestId(tooltipTestId));

    expect(await screen.findByText(tooltip)).toBeInTheDocument();

    await userEvent.hover(screen.getByText(value));

    expect(await screen.findAllByText(value)).toHaveLength(2);
  });

  it("renders a loading state", async () => {
    render(
      <InstitutionField
        isLoading
        name={name}
        tooltip={tooltip}
        tooltipTestId={tooltipTestId}
        value={value}
      />,
    );

    await expectSkeletonLoader();
  });

  it("doesn't render a value tooltip if its disabled", async () => {
    render(
      <InstitutionField
        isLoading={false}
        name={name}
        shouldDisableValueTooltip
        tooltip={tooltip}
        tooltipTestId={tooltipTestId}
        value={value}
      />,
    );

    await userEvent.hover(screen.getByText(value));

    expect(await screen.findAllByText(value)).toHaveLength(1);
  });
});
