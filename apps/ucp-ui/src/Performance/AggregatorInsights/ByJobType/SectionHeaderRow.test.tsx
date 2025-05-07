import React from "react";
import { render, screen } from "../../../shared/test/testUtils";
import SectionHeaderRow, {
  RECTANGLE_DIVIDER_TEST_ID,
} from "./SectionHeaderRow";
import { Table, TableBody } from "@mui/material";

describe("<SectionHeaderRow />", () => {
  it("renders the divider, title, and children", () => {
    const children = "testChildren";
    const title = "title";

    render(
      <Table>
        <TableBody>
          <SectionHeaderRow numberOfColumns={1} title={title}>
            {children}
          </SectionHeaderRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByText(children)).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByTestId(RECTANGLE_DIVIDER_TEST_ID)).toBeInTheDocument();
  });
});
