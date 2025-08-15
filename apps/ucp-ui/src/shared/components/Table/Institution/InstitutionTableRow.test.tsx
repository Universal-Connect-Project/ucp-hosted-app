import React from "react";
import { InstitutionTableRow } from "./InstitutionTableRow";
import {
  expectLocation,
  render,
  screen,
  userEvent,
} from "../../../test/testUtils";
import { institutionRoute } from "../../../constants/routes";

describe("<InstitutionTableRow />", () => {
  it("renders the children and navigates on click", async () => {
    const institutionId = "institutionId";

    const childText = "Test Content";

    render(
      <table>
        <tbody>
          <InstitutionTableRow id={institutionId} isLoading={false}>
            <td>{childText}</td>
          </InstitutionTableRow>
        </tbody>
      </table>,
    );

    await userEvent.click(screen.getByRole("row"));

    expectLocation(institutionRoute.createPath({ institutionId }));

    expect(screen.getByText(childText)).toBeInTheDocument();
  });
});
