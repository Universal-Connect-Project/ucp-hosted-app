import React from "react";
import ApiKey from "./ApiKey";
import { render, screen, userEvent } from "../shared/test/testUtils";
import {
  API_KEYS_COPY_BUTTON_TEST_ID,
  API_KEYS_HIDE_KEY_BUTTON_TEST_ID,
  API_KEYS_SHOW_KEY_BUTTON_TEST_ID,
} from "./constants";

const label = "testLabel";
const value = "testValue";

describe("<ApiKey />", () => {
  it("copies the value to clipboard and shows a snackbar", async () => {
    jest.spyOn(navigator.clipboard, "writeText");

    render(<ApiKey isLoading={false} label={label} value={value} />);

    await userEvent.click(
      screen.getByTestId(`${API_KEYS_COPY_BUTTON_TEST_ID}-${label}`),
    );

    expect(
      await screen.findByText(`${label} has been copied to your clipboard.`),
    ).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(value);
  });

  it("changes the value of the input from password to text when clicking on the visibility icon, shows the correct icon, and changes the type back when toggling again", async () => {
    render(<ApiKey isLoading={false} label={label} value={value} />);

    expect(screen.getByLabelText(label)).toHaveAttribute("type", "password");

    await userEvent.click(
      screen.getByTestId(`${API_KEYS_SHOW_KEY_BUTTON_TEST_ID}-${label}`),
    );

    expect(screen.getByLabelText(label)).toHaveAttribute("type", "text");

    await userEvent.click(
      screen.getByTestId(`${API_KEYS_HIDE_KEY_BUTTON_TEST_ID}-${label}`),
    );

    expect(screen.getByLabelText(label)).toHaveAttribute("type", "password");
  });
});
