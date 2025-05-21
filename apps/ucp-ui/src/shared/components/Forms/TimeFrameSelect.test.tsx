import React from "react";
import { render, screen, userEvent } from "../../test/testUtils";
import TimeFrameSelect, { useTimeFrameSelect } from "./TimeFrameSelect";
import {
  thirtyDaysOption,
  TIME_FRAME_LABEL_TEXT,
  timeFrameOptions,
} from "./constants";

const TestComponent = () => {
  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();

  return <TimeFrameSelect onChange={handleTimeFrameChange} value={timeFrame} />;
};

describe("<TimeFrameSelect />", () => {
  it("uses 30 days as the default time frame", async () => {
    render(<TestComponent />);

    expect(await screen.findByText(thirtyDaysOption.label)).toBeInTheDocument();
  });

  it("changes the time frame", async () => {
    render(<TestComponent />);

    await userEvent.click(screen.getByLabelText(TIME_FRAME_LABEL_TEXT));

    await userEvent.click(
      await screen.findByRole("option", { name: timeFrameOptions[0].label }),
    );

    expect(screen.queryByRole("option", { name: timeFrameOptions[0].label }));

    expect(screen.getByText(timeFrameOptions[0].label)).toBeInTheDocument();
  });
});
