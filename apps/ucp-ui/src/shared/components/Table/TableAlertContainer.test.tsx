import React from "react";
import { render, screen } from "../../test/testUtils";
import { TableAlertContainer } from "./TableAlertContainer";

describe("<TableAlertContainer />", () => {
  it("renders children inside the container", () => {
    const testContent = "Test Alert Content";
    render(
      <TableAlertContainer>
        <div>{testContent}</div>
      </TableAlertContainer>,
    );
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });
});
