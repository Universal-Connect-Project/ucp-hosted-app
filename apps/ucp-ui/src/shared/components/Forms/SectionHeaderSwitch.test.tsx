import React from "react";
import SectionHeaderSwitch from "./SectionHeaderSwitch";
import { useForm } from "react-hook-form";
import { render, screen, userEvent } from "../../test/testUtils";

const label = "testLabel";
const name = "on";
const tooltipTitle = "testTooltipTitle";

const TestComponent = () => {
  const { control } = useForm({
    defaultValues: {
      [name]: true,
    },
  });

  return (
    <SectionHeaderSwitch
      control={control}
      name={name}
      label={label}
      tooltipTitle={tooltipTitle}
    />
  );
};

describe("<SectionHeaderSwitch />", () => {
  it("changes the value on click", async () => {
    render(<TestComponent />);

    expect(await screen.findByLabelText(label)).toBeChecked();

    await userEvent.click(screen.getByLabelText(label));

    expect(screen.getByLabelText(label)).not.toBeChecked();

    await userEvent.click(screen.getByLabelText(label));

    expect(screen.getByLabelText(label)).toBeChecked();
  });
});
