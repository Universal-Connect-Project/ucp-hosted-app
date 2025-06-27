import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { render, screen } from "../shared/test/testUtils";
import ApiKeys from "./ApiKeys";
import {
  API_KEYS_REQUEST_ACCESS_TITLE_TEXT,
  REQUEST_API_KEY_ACCESS_BUTTON_TEXT,
} from "./constants";
import { UserRoles } from "../shared/constants/roles";

jest.mock("@auth0/auth0-react");

describe("<RequestApiKeys />", () => {
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
      "mailto:ucw-support-aaaanxls523igauix7ft7lzjpu@mx.org.slack.com?subject=API Keys Request for test@test.com&body=Company Name:%0D%0AAggregator(s) you are planning to implement:%0D%0AHow did you hear about us?%0D%0A%0D%0A----------Do not edit anything below this line----------%0D%0AUser Email: test@test.com",
    );
  });
});
