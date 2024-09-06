import React from "react";
import { render, screen, userEvent, waitFor } from "../shared/test/testUtils";
import { Button } from "@mui/material";
import { useAppDispatch } from "../shared/utils/redux";
import { displaySnackbar } from "../shared/reducers/snackbar";

const buttonText = "buttonText";

const message = "testMessage";

const closeTargetTestId = "close";

const TestComponent = () => {
  const dispatch = useAppDispatch();

  return (
    <>
      <div data-testid={closeTargetTestId} />
      <Button onClick={() => dispatch(displaySnackbar(message))}>
        {buttonText}
      </Button>
    </>
  );
};

describe("<Snackbars />", () => {
  it("displays a snackbar and closes it when clicking elsewhere", async () => {
    render(<TestComponent />);

    await userEvent.click(screen.getByText(buttonText));

    expect(await screen.findByText(message)).toBeInTheDocument();

    await userEvent.click(screen.getByTestId(closeTargetTestId));

    await waitFor(() =>
      expect(screen.queryByText(message)).not.toBeInTheDocument(),
    );
  });

  it("clicking on the same snackbar triggering button after its open keeps it open", async () => {
    render(<TestComponent />);

    await userEvent.click(screen.getByText(buttonText));

    expect(await screen.findByText(message)).toBeInTheDocument();

    await userEvent.click(screen.getByText(buttonText));

    expect(await screen.findByText(message)).toBeInTheDocument();
  });
});
