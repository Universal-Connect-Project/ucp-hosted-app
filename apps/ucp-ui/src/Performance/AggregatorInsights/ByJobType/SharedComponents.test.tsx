import React from "react";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";
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
        <Table>
          <TableBody>
            <TableRowWithPaddingCells>
              <TableCell />
            </TableRowWithPaddingCells>
          </TableBody>
        </Table>,
      );

      expect(container.querySelectorAll("td")).toHaveLength(3);
    });
  });

  describe("<NoDataCell />", () => {
    it("renders children if hasData", () => {
      const children = "testChildren";

      render(
        <Table>
          <TableBody>
            <TableRow>
              <NoDataCell hasData isLoading={false}>
                {children}
              </NoDataCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      expect(screen.getByText(children)).toBeInTheDocument();
    });

    it("renders 'No data' if !hasData", () => {
      const children = "testChildren";

      render(
        <Table>
          <TableBody>
            <TableRow>
              <NoDataCell hasData={false} isLoading={false}>
                {children}
              </NoDataCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      expect(screen.queryByText(children)).not.toBeInTheDocument();
      expect(screen.getByText("No data")).toBeInTheDocument();
    });

    it("renders a loading state if isLoading", async () => {
      const children = "testChildren";

      render(
        <Table>
          <TableBody>
            <TableRow>
              <NoDataCell hasData isLoading={true}>
                {children}
              </NoDataCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      await expectSkeletonLoader();
    });
  });
});
