import React from "react";
import { render, screen, userEvent, waitFor } from "../shared/test/testUtils";
import Layout from "./Layout";
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
  it("displays a snackbar, closes it when clicking elsewhere, and displays it again even if the same message is dispatched", async () => {
    render(
      <Layout>
        <TestComponent />
      </Layout>,
      {
        shouldRenderSnackbars: false,
      },
    );

    await userEvent.click(screen.getByText(buttonText));

    expect(await screen.findByText(message)).toBeInTheDocument();

    await userEvent.click(screen.getByTestId(closeTargetTestId));

    await waitFor(() =>
      expect(screen.queryByText(message)).not.toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText(buttonText));

    expect(await screen.findByText(message)).toBeInTheDocument();
  });
});
