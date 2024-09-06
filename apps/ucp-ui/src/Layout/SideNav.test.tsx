import React from "react";
import { render, screen, userEvent, waitFor } from "../shared/test/testUtils";
import Routes from "../Routes";
import { API_KEYS_CARD_TITLE_TEXT } from "../ApiKeys/constants";
import {
  SIDE_NAV_CONTACT_US_LINK_TEXT,
  SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
} from "./constants";
import { SUPPORT_EMAIL } from "../shared/constants/support";

const mockLogout = jest.fn();

jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    logout: mockLogout,
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withAuthenticationRequired: (component: any): any => component,
}));

describe("<SideNav />", () => {
  it("calls logout on click", async () => {
    render(<Routes />);

    await userEvent.click(screen.getByText("Log out"));

    await waitFor(() => expect(mockLogout).toHaveBeenCalled());
  });

  it("navigates to widget management after clicking on the link", async () => {
    render(<Routes />);

    await userEvent.click(
      (await screen.findAllByText(SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT))[0],
    );

    expect(
      await screen.findByText(API_KEYS_CARD_TITLE_TEXT),
    ).toBeInTheDocument();
  });

  it("renders a contact us button", async () => {
    render(<Routes />);

    const contactLink = await screen.findByText(SIDE_NAV_CONTACT_US_LINK_TEXT);

    expect(contactLink).toBeInTheDocument();

    expect(contactLink).toHaveAttribute("href", `mailto:${SUPPORT_EMAIL}`);
  });
});
