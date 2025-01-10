import React from "react";
import {
  expectSkeletonLoader,
  render,
  screen,
  userEvent,
} from "../shared/test/testUtils";
import UCPIdCell from "./UCPIdCell";
import { Table, TableBody, TableRow } from "@mui/material";
import {
  INSTITUTIONS_TABLE_UCP_ID_COPY_BUTTON_TEST_ID,
  INSTITUTIONS_TABLE_UCP_ID_COPY_SUCCESS_MESSAGE,
} from "./constants";

const testId = "testId";

const TestComponent = ({
  id,
  isLoading,
}: {
  id: string;
  isLoading: boolean;
}) => (
  <Table>
    <TableBody>
      <TableRow>
        <UCPIdCell id={id} isLoading={isLoading} />
      </TableRow>
    </TableBody>
  </Table>
);

describe("<UCPIdCell />", () => {
  it("renders a loading state if isLoading", async () => {
    render(<TestComponent id={testId} isLoading />);

    await expectSkeletonLoader();
  });

  it("copies the id to the clipboard and displays a snackbar", async () => {
    jest.spyOn(navigator.clipboard, "writeText");

    render(<TestComponent id={testId} isLoading={false} />);

    await userEvent.click(
      screen.getByTestId(INSTITUTIONS_TABLE_UCP_ID_COPY_BUTTON_TEST_ID),
    );

    expect(
      await screen.findByText(INSTITUTIONS_TABLE_UCP_ID_COPY_SUCCESS_MESSAGE),
    ).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testId);
  });
});
