import React from "react";
import { UserRoles } from "../shared/constants/roles";
import ApiKeys from "./ApiKeys";
import { render, screen, userEvent, waitFor } from "../shared/test/testUtils";
import {
  API_KEY_TOOLTIP_TEST_ID,
  API_KEY_TOOLTIP_TEXT,
  API_KEYS_CARD_TITLE_TEXT,
  API_KEYS_GENERATE_API_KEYS_BUTTON_TEXT,
  API_KEYS_GENERATE_API_KEYS_FAILURE_TEXT,
  API_KEYS_GENERATE_API_KEYS_SUCCESS_TEXT,
  API_KEYS_GET_KEYS_FAILURE_TEXT,
  API_KEYS_REQUEST_ACCESS_TITLE_TEXT,
  REQUEST_API_KEY_ACCESS_BUTTON_TEXT,
} from "./constants";
import { useAuth0 } from "@auth0/auth0-react";
import { server } from "../shared/test/testServer";
import { http, HttpResponse } from "msw";
import {
  AUTHENTICATION_SERVICE_CREATE_API_KEYS_URL,
  AUTHENTICATION_SERVICE_GET_API_KEYS_URL,
} from "./api";
import { TRY_AGAIN_BUTTON_TEXT } from "../shared/components/constants";

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

  describe("has widget role", () => {
    beforeEach(() => {
      // eslint-disable-next-line
      (useAuth0 as any).mockReturnValue({
        user: {
          "ucw/roles": [UserRoles.WidgetHost],
        },
      });
    });

    it("shows an error message with retry when getting keys fails and it's not a 404", async () => {
      server.use(
        http.get(
          AUTHENTICATION_SERVICE_GET_API_KEYS_URL,
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      render(<ApiKeys />);

      expect(
        await screen.findByText(API_KEYS_GET_KEYS_FAILURE_TEXT),
      ).toBeInTheDocument();

      server.use(
        http.get(
          AUTHENTICATION_SERVICE_GET_API_KEYS_URL,
          () => new HttpResponse(null, { status: 404 }),
        ),
      );

      await userEvent.click(screen.getByText(TRY_AGAIN_BUTTON_TEXT));

      await screen.findByRole("button", {
        name: API_KEYS_GENERATE_API_KEYS_BUTTON_TEXT,
      });
    });

    it(`allows api key generation when getting keys returns a 404`, async () => {
      render(<ApiKeys />);

      await userEvent.click(
        await screen.findByRole("button", {
          name: API_KEYS_GENERATE_API_KEYS_BUTTON_TEXT,
        }),
      );

      expect(
        await screen.findByText(API_KEYS_GENERATE_API_KEYS_SUCCESS_TEXT),
      ).toBeInTheDocument();
    });

    it("shows an error message with retry if key generation fails", async () => {
      server.use(
        http.post(
          AUTHENTICATION_SERVICE_CREATE_API_KEYS_URL,
          () => new HttpResponse(null, { status: 400 }),
        ),
      );

      render(<ApiKeys />);

      await userEvent.click(
        await screen.findByRole("button", {
          name: API_KEYS_GENERATE_API_KEYS_BUTTON_TEXT,
        }),
      );

      expect(
        await screen.findByText(API_KEYS_GENERATE_API_KEYS_FAILURE_TEXT),
      ).toBeInTheDocument();

      server.use(
        http.post(
          AUTHENTICATION_SERVICE_CREATE_API_KEYS_URL,
          () => new HttpResponse(null, { status: 201 }),
        ),
      );

      await userEvent.click(screen.getByText(TRY_AGAIN_BUTTON_TEXT));

      expect(
        await screen.findByText(API_KEYS_GENERATE_API_KEYS_SUCCESS_TEXT),
      ).toBeInTheDocument();
    });
  });
});
