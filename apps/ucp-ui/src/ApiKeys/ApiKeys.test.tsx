import React from "react";
import { UserRoles } from "../shared/constants/roles";
import ApiKeys from "./ApiKeys";
import { render, screen, userEvent, waitFor } from "../shared/test/testUtils";
import {
  API_KEY_TOOLTIP_TEST_ID,
  API_KEY_TOOLTIP_TEXT,
  API_KEYS_CARD_TITLE_TEXT,
  API_KEYS_CLIENT_ID_LABEL_TEXT,
  API_KEYS_CLIENT_SECRET_LABEL_TEXT,
  API_KEYS_GENERATE_API_KEYS_BUTTON_TEXT,
  API_KEYS_GET_KEYS_FAILURE_TEXT,
} from "./constants";
import { useAuth0 } from "@auth0/auth0-react";
import { server } from "../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { AUTHENTICATION_SERVICE_GET_API_KEYS_URL } from "./api";
import { TRY_AGAIN_BUTTON_TEXT } from "../shared/components/constants";

jest.mock("@auth0/auth0-react");

describe("ApiKeys", () => {
  it("opens the tooltip on click and closes when clicking elsewhere", async () => {
    // eslint-disable-next-line
    (useAuth0 as any).mockReturnValue({
      user: {},
    });

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
  });

  it("renders the api keys", async () => {
    const clientId = "testClientId";
    const clientSecret = "testClientSecret";

    server.use(
      http.get(AUTHENTICATION_SERVICE_GET_API_KEYS_URL, () =>
        HttpResponse.json({
          clientId,
          clientSecret,
        }),
      ),
    );

    render(<ApiKeys />);

    expect(
      await screen.findByLabelText(API_KEYS_CLIENT_ID_LABEL_TEXT),
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(API_KEYS_CLIENT_SECRET_LABEL_TEXT),
    ).toBeInTheDocument();
  });
});
