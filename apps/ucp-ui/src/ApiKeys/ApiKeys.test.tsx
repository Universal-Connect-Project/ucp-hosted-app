import React from "react";
import { UserRoles } from "../shared/constants/roles";
import ApiKeys from "./ApiKeys";
import { render, screen, userEvent, waitFor } from "../shared/test/testUtils";
import {
  API_KEY_TOOLTIP_TEST_ID,
  API_KEY_TOOLTIP_TEXT,
  API_KEYS_CARD_TITLE_TEXT,
  API_KEYS_REQUEST_ACCESS_TITLE_TEXT,
  REQUEST_API_KEY_ACCESS_BUTTON_TEXT,
} from "./constants";
import { useAuth0 } from "@auth0/auth0-react";

jest.mock("@auth0/auth0-react");

describe("ApiKeys", () => {
  it(`shows a request api keys ui if you don't have the ${UserRoles.WidgetHost} role `, () => {
    const email = "test@test.com";

    // eslint-disable-next-line
    (useAuth0 as any).mockReturnValue({
      user: {
        email,
      },
    });

    render(<ApiKeys />);

    expect(
      screen.getByText(API_KEYS_REQUEST_ACCESS_TITLE_TEXT),
    ).toBeInTheDocument();

    const button = screen.getByRole("link", {
      name: REQUEST_API_KEY_ACCESS_BUTTON_TEXT,
    });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute(
      "href",
      "mailto:ucw-support-aaaanxls523igauix7ft7lzjpu@mx.org.slack.com?subject=API Keys Request for test@test.com&body=%0D%0A%0D%0A----------Do not edit anything below this line----------%0D%0AUser Email: test@test.com",
    );
  });

  it(`doesn't show a request api keys email button if you have the ${UserRoles.WidgetHost} role `, () => {
    // eslint-disable-next-line
    (useAuth0 as any).mockReturnValue({
      user: {
        "ucw/roles": [UserRoles.WidgetHost],
      },
    });

    render(<ApiKeys />);

    expect(
      screen.queryByText(API_KEYS_REQUEST_ACCESS_TITLE_TEXT),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: REQUEST_API_KEY_ACCESS_BUTTON_TEXT }),
    ).not.toBeInTheDocument();
  });

  it("opens the tooltip on click and closes when clicking elsewhere", async () => {
    render(<ApiKeys />);

    expect(screen.queryByText(API_KEY_TOOLTIP_TEXT)).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId(API_KEY_TOOLTIP_TEST_ID));

    expect(await screen.findByText(API_KEY_TOOLTIP_TEXT)).toBeInTheDocument();

    await userEvent.click(screen.getByText(API_KEYS_CARD_TITLE_TEXT));

    await waitFor(() =>
      expect(screen.queryByText(API_KEY_TOOLTIP_TEXT)).not.toBeInTheDocument(),
    );
  });
});
