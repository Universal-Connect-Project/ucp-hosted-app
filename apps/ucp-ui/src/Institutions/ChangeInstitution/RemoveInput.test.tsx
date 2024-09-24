import React from "react";
import { render, screen, userEvent } from "../../shared/test/testUtils";
import RemoveInput from "./RemoveInput";
import { REMOVE_INPUT_TEST_ID } from "./constants";

describe("<RemoveInput />", () => {
  it("calls the onRemove function with the index on click", async () => {
    const onRemove = jest.fn();

    render(<RemoveInput index={0} onRemove={onRemove} />);

    await userEvent.click(screen.getByTestId(REMOVE_INPUT_TEST_ID));

    expect(onRemove).toHaveBeenCalledWith(0);
  });
});
