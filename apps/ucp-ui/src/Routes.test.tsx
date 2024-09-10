import React from "react";
import { render, screen, userEvent } from "./shared/test/testUtils";
import Routes from "./Routes";
import { API_KEYS_CARD_TITLE_TEXT } from "./ApiKeys/constants";
import { INSTITUTIONS_PAGE_TITLE } from "./Institutions/constants";
import { SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT } from "./Layout/constants";

jest.mock("@auth0/auth0-react");

describe("<Routes />", () => {
  it("renders Institutions by default", async () => {
    render(<Routes />);

    expect(await screen.findAllByText(INSTITUTIONS_PAGE_TITLE)).toHaveLength(2);
  });

  it("renders Widget Management", async () => {
    render(<Routes />);

    await userEvent.click(
      await screen.findByRole("link", {
        name: SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
      }),
    );

    expect(
      await screen.findByText(API_KEYS_CARD_TITLE_TEXT),
    ).toBeInTheDocument();
  });
});
