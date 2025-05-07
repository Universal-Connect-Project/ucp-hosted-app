import React from "react";
import { TableCell } from "@mui/material";
import {
  expectSkeletonLoader,
  render,
  screen,
} from "../../../shared/test/testUtils";
import { NoDataCell, TableRowWithPaddingCells } from "./SharedComponents";

describe("Shared components", () => {
  describe("<TableRowWithPaddingCells />", () => {
    it("renders 2 padding cells around the children", () => {
      const { container } = render(
        <TableRowWithPaddingCells>
          <TableCell />
        </TableRowWithPaddingCells>,
      );

      expect(container.querySelectorAll("td")).toHaveLength(3);
    });
  });

  describe("<NoDataCell />", () => {
    it("renders children if hasData", () => {
      const children = "testChildren";

      render(
        <NoDataCell hasData isLoading={false}>
          {children}
        </NoDataCell>,
      );

      expect(screen.getByText(children)).toBeInTheDocument();
    });

    it("renders 'No data' if !hasData", () => {
      const children = "testChildren";

      render(
        <NoDataCell hasData={false} isLoading={false}>
          {children}
        </NoDataCell>,
      );

      expect(screen.queryByText(children)).not.toBeInTheDocument();
      expect(screen.getByText("No data")).toBeInTheDocument();
    });

    it("renders a loading state if isLoading", async () => {
      const children = "testChildren";

      render(
        <NoDataCell hasData isLoading={true}>
          {children}
        </NoDataCell>,
      );

      await expectSkeletonLoader();
    });
  });
});
