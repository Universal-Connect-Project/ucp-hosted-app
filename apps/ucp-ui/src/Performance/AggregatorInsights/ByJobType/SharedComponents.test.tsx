import React from "react";
import { Table, TableBody, TableCell } from "@mui/material";
import { render } from "../../../shared/test/testUtils";
import { TableRowWithPaddingCells } from "./SharedComponents";

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
});
