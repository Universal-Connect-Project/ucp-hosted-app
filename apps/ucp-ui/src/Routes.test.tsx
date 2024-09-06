import React from "react";
import { render, screen } from "./shared/test/testUtils";
import Routes from "./Routes";
import { API_KEYS_CARD_TITLE_TEXT } from "./ApiKeys/constants";

jest.mock("@auth0/auth0-react");

describe("<Routes />", () => {
  it("renders widget management by default", async () => {
    render(<Routes />);

    expect(
      await screen.findByText(API_KEYS_CARD_TITLE_TEXT),
    ).toBeInTheDocument();
  });
});
