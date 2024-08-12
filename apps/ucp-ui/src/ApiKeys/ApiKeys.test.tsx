import React from "react";
import { UserRoles } from "../shared/constants/roles";
import ApiKeys from "./ApiKeys";
import { render, screen } from "../shared/test/testUtils";
import { REQUEST_API_KEY_ACCESS_BUTTON_TEXT } from "./constants";
import { useAuth0 } from "@auth0/auth0-react";

jest.mock("@auth0/auth0-react");

describe("ApiKeys", () => {
  it(`shows a request api keys email button if you don't have the ${UserRoles.WidgetHost} role `, () => {
    const email = "test@test.com";

    // eslint-disable-next-line
    (useAuth0 as any).mockReturnValue({
      user: {
        email,
      },
    });

    render(<ApiKeys />);

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
      screen.queryByRole("link", { name: REQUEST_API_KEY_ACCESS_BUTTON_TEXT }),
    ).not.toBeInTheDocument();
  });
});
