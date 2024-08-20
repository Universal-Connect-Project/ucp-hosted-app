import React from "react";
import ApiKeys from "./ApiKeys";
import {
  render,
  screen,
  userEvent,
  waitFor,
  waitForLoad,
} from "../shared/test/testUtils";
import { useAuth0 } from "@auth0/auth0-react";
import { UserRoles } from "../shared/constants/roles";
import {
  API_KEYS_CANCEL_ROTATE_SECRET_BUTTON_TEXT,
  API_KEYS_CONFIRM_ROTATE_SECRET_BUTTON_TEXT,
  API_KEYS_MANAGE_BUTTON_TEXT,
  API_KEYS_MANAGE_CLOSE_DRAWER_BUTTON_TEXT,
  API_KEYS_MANAGE_LIST_ROTATE_TEXT,
  API_KEYS_ROTATE_API_KEYS_ERROR_TEXT,
  API_KEYS_ROTATE_API_KEYS_SUCCESS_TEXT,
} from "./constants";
import { server } from "../shared/test/testServer";
import { http, HttpResponse } from "msw";
import {
  AUTHENTICATION_SERVICE_GET_API_KEYS_URL,
  AUTHENTICATION_SERVICE_ROTATE_API_KEYS_URL,
} from "./api";
import { TRY_AGAIN_BUTTON_TEXT } from "../shared/components/constants";

jest.mock("@auth0/auth0-react");

const clientId = "testClientId";
const clientSecret = "testClientSecret";

describe("<ManageApiKeys />", () => {
  beforeEach(() => {
    // eslint-disable-next-line
    (useAuth0 as any).mockReturnValue({
      user: {
        "ucw/roles": [UserRoles.WidgetHost],
      },
    });
  });

  it("shows the manage button while loading and hides it if there aren't any keys", async () => {
    render(<ApiKeys />);

    expect(screen.getByText(API_KEYS_MANAGE_BUTTON_TEXT)).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.queryByText(API_KEYS_MANAGE_BUTTON_TEXT),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows a success message, closes the drawer, and hides the confirm rotation button after successful key rotation", async () => {
    server.use(
      http.get(AUTHENTICATION_SERVICE_GET_API_KEYS_URL, () =>
        HttpResponse.json({
          clientId,
          clientSecret,
        }),
      ),
    );

    render(<ApiKeys />);

    await waitForLoad();

    await userEvent.click(await screen.findByText(API_KEYS_MANAGE_BUTTON_TEXT));

    await userEvent.click(
      await screen.findByText(API_KEYS_MANAGE_LIST_ROTATE_TEXT),
    );

    await userEvent.click(
      await screen.findByText(API_KEYS_CONFIRM_ROTATE_SECRET_BUTTON_TEXT),
    );

    expect(
      await screen.findByText(API_KEYS_ROTATE_API_KEYS_SUCCESS_TEXT),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.queryByText(API_KEYS_MANAGE_CLOSE_DRAWER_BUTTON_TEXT),
      ).not.toBeInTheDocument(),
    );

    await userEvent.click(await screen.findByText(API_KEYS_MANAGE_BUTTON_TEXT));

    expect(
      await screen.findByText(API_KEYS_MANAGE_LIST_ROTATE_TEXT),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(API_KEYS_CONFIRM_ROTATE_SECRET_BUTTON_TEXT),
    ).not.toBeInTheDocument();
  });

  it("shows a failure message with retry", async () => {
    server.use(
      http.get(AUTHENTICATION_SERVICE_GET_API_KEYS_URL, () =>
        HttpResponse.json({
          clientId,
          clientSecret,
        }),
      ),
    );

    server.use(
      http.post(
        AUTHENTICATION_SERVICE_ROTATE_API_KEYS_URL,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(<ApiKeys />);

    await waitForLoad();

    await userEvent.click(await screen.findByText(API_KEYS_MANAGE_BUTTON_TEXT));

    await userEvent.click(
      await screen.findByText(API_KEYS_MANAGE_LIST_ROTATE_TEXT),
    );

    await userEvent.click(
      await screen.findByText(API_KEYS_CONFIRM_ROTATE_SECRET_BUTTON_TEXT),
    );

    expect(
      await screen.findByText(API_KEYS_ROTATE_API_KEYS_ERROR_TEXT),
    ).toBeInTheDocument();

    server.use(
      http.post(
        AUTHENTICATION_SERVICE_ROTATE_API_KEYS_URL,
        () => new HttpResponse(null, { status: 200 }),
      ),
    );

    await userEvent.click(screen.getByText(TRY_AGAIN_BUTTON_TEXT));

    expect(
      await screen.findByText(API_KEYS_ROTATE_API_KEYS_SUCCESS_TEXT),
    ).toBeInTheDocument();
  });

  it("closes the management drawer when clicking close", async () => {
    server.use(
      http.get(AUTHENTICATION_SERVICE_GET_API_KEYS_URL, () =>
        HttpResponse.json({
          clientId,
          clientSecret,
        }),
      ),
    );

    render(<ApiKeys />);

    await waitForLoad();

    await userEvent.click(await screen.findByText(API_KEYS_MANAGE_BUTTON_TEXT));

    await userEvent.click(
      await screen.findByText(API_KEYS_MANAGE_CLOSE_DRAWER_BUTTON_TEXT),
    );

    await waitFor(() =>
      expect(
        screen.queryByText(API_KEYS_MANAGE_CLOSE_DRAWER_BUTTON_TEXT),
      ).not.toBeInTheDocument(),
    );
  });

  it("hides the confirm rotation button on cancel", async () => {
    server.use(
      http.get(AUTHENTICATION_SERVICE_GET_API_KEYS_URL, () =>
        HttpResponse.json({
          clientId,
          clientSecret,
        }),
      ),
    );

    render(<ApiKeys />);

    await waitForLoad();

    await userEvent.click(await screen.findByText(API_KEYS_MANAGE_BUTTON_TEXT));

    await userEvent.click(
      await screen.findByText(API_KEYS_MANAGE_LIST_ROTATE_TEXT),
    );

    await userEvent.click(
      await screen.findByText(API_KEYS_CANCEL_ROTATE_SECRET_BUTTON_TEXT),
    );

    await waitFor(() =>
      expect(
        screen.queryByText(API_KEYS_CONFIRM_ROTATE_SECRET_BUTTON_TEXT),
      ).not.toBeInTheDocument(),
    );
  });
});
