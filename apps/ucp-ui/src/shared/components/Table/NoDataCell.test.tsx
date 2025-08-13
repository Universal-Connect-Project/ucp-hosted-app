import React from "react";
import { expectSkeletonLoader, render, screen } from "../../test/testUtils";
import { NoDataCell } from "./NoDataCell";
import { NO_DATA_CELL_TEXT } from "./noDataCellConstants";

const children = "Test children";

const TestComponent = ({
  hasData,
  isLoading,
}: {
  hasData: boolean;
  isLoading: boolean;
}) => (
  <table>
    <tbody>
      <tr>
        <NoDataCell hasData={hasData} isLoading={isLoading}>
          {children}
        </NoDataCell>
      </tr>
    </tbody>
  </table>
);

describe("<NoDataCell />", () => {
  it("renders 'No data' when hasData is false", () => {
    render(<TestComponent hasData={false} isLoading={false} />);
    expect(screen.getByText(NO_DATA_CELL_TEXT)).toBeInTheDocument();
  });

  it("renders a loading state when isLoading is true", async () => {
    render(<TestComponent hasData={false} isLoading={true} />);
    await expectSkeletonLoader();
  });

  it("renders children when hasData is true", () => {
    render(<TestComponent hasData={true} isLoading={false} />);
    expect(screen.getByText(children)).toBeInTheDocument();
  });
});
