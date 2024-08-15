import React from "react";
import { Button, Snackbar } from "@mui/material";
import useSuccessSnackbar from "./useSuccessSnackbar";
import { render, screen, userEvent } from "../test/testUtils";

const message = "testMessage";
const buttonText = "testButton";

const SuccessSnackbar = () => {
  const { handleOpenSuccessSnackbarWithMessage, successSnackbarProps } =
    useSuccessSnackbar();

  return (
    <>
      <Button onClick={() => handleOpenSuccessSnackbarWithMessage(message)}>
        {buttonText}
      </Button>
      <Snackbar {...successSnackbarProps} />
    </>
  );
};

describe("useSuccessSnackbar", () => {
  it("renders the snackbar with the message", async () => {
    render(<SuccessSnackbar />);

    expect(screen.queryByText(message)).not.toBeInTheDocument();

    await userEvent.click(screen.getByText(buttonText));

    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
