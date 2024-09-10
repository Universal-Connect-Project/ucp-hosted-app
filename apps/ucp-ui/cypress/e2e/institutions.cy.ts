import { INSTITUTIONS_ROW_TEST_ID } from "../../src/Institutions/constants";

describe("institutions", () => {
  it("renders institutions", () => {
    cy.loginWithoutWidgetRole();

    cy.findAllByTestId(new RegExp(INSTITUTIONS_ROW_TEST_ID)).should(
      "have.length.above",
      0,
    );
  });
});
