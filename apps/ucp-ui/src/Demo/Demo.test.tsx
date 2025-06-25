import React from "react";
import { render, screen, userEvent } from "../shared/test/testUtils";
import Demo from "./Demo";
import {
  WIDGET_DEMO_ERROR_MESSAGE,
  WIDGET_DEMO_IFRAME_TITLE,
  WIDGET_DEMO_PAGE_TITLE,
} from "./constants";
import { server } from "../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";
import { TRY_AGAIN_BUTTON_TEXT } from "../shared/components/constants";
import { expectSkeletonLoader } from "../shared/test/testUtils";

describe("<Demo />", () => {
  it("renders the page title, and shows a loading state", async () => {
    render(<Demo />);
    await expectSkeletonLoader();
    expect(screen.getByText(WIDGET_DEMO_PAGE_TITLE)).toBeInTheDocument();
  });

  it("renders the widget demo iframe", async () => {
    render(<Demo />);

    const iframe = await screen.findByTitle(WIDGET_DEMO_IFRAME_TITLE);
    expect(iframe).toBeInTheDocument();
  });

  it("renders an error message when token fetch fails", async () => {
    server.use(
      http.get(`${WIDGET_DEMO_BASE_URL}/api/token`, () =>
        HttpResponse.json({ error: "Failed to fetch token" }, { status: 500 }),
      ),
    );

    render(<Demo />);

    expect(
      await screen.findByText(WIDGET_DEMO_ERROR_MESSAGE),
    ).toBeInTheDocument();

    server.use(
      http.get(`${WIDGET_DEMO_BASE_URL}/api/token`, () =>
        HttpResponse.json({ token: "randomtoken" }),
      ),
    );

    await userEvent.click(screen.getByText(TRY_AGAIN_BUTTON_TEXT));
    const iframe = await screen.findByTitle(WIDGET_DEMO_IFRAME_TITLE);
    expect(iframe).toBeInTheDocument();
  });
});
