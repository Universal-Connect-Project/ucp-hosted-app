import React from "react";
import { render, screen } from "../../test/testUtils";
import { TableContainer } from "./TableContainer";

describe("<TableContainer />", () => {
  it("renders children inside the container", () => {
    const testContent = "Test Table Content";
    render(
      <TableContainer>
        <div>{testContent}</div>
      </TableContainer>,
    );
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });
});
