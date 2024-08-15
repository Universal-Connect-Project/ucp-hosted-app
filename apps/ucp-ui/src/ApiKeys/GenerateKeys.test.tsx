import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { UserRoles } from "../shared/constants/roles";
import { server } from "../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { AUTHENTICATION_SERVICE_CREATE_API_KEYS_URL } from "./api";
import { render, screen, userEvent } from "../shared/test/testUtils";
import ApiKeys from "./ApiKeys";
import {
  API_KEYS_GENERATE_API_KEYS_BUTTON_TEXT,
  API_KEYS_GENERATE_API_KEYS_FAILURE_TEXT,
  API_KEYS_GENERATE_API_KEYS_SUCCESS_TEXT,
} from "./constants";
import { TRY_AGAIN_BUTTON_TEXT } from "../shared/components/constants";

jest.mock("@auth0/auth0-react");

describe("<GenerateKeys />", () => {
  beforeEach(() => {
    // eslint-disable-next-line
    (useAuth0 as any).mockReturnValue({
      user: {
        "ucw/roles": [UserRoles.WidgetHost],
      },
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
