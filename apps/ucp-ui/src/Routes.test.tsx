import React from "react";
import { render, screen, userEvent } from "./shared/test/testUtils";
import Routes from "./Routes";
import { API_KEYS_CARD_TITLE_TEXT } from "./ApiKeys/constants";
import { INSTITUTIONS_PAGE_TITLE } from "./Institutions/constants";
import {
  SIDE_NAV_PERFORMANCE_LINK_TEXT,
  SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
} from "./Layout/constants";
import { PERFORMANCE_PAGE_TITLE } from "./Performance/constants";
import { PERFORMANCE_ROUTE } from "./shared/constants/routes";
import * as launchDarkly from "launchdarkly-react-client-sdk";

jest.mock("launchdarkly-react-client-sdk");
jest.mock("@auth0/auth0-react");

describe("<Routes />", () => {
  beforeEach(() => {
    jest.spyOn(launchDarkly, "useFlags").mockReturnValue({});
  });

  it("renders Institutions by default", async () => {
    render(<Routes />, { shouldRenderRouter: false });

    expect(await screen.findAllByText(INSTITUTIONS_PAGE_TITLE)).toHaveLength(2);
  });

  it("renders Widget Management", async () => {
    render(<Routes />, { shouldRenderRouter: false });

    await userEvent.click(
      await screen.findByRole("link", {
        name: SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
      }),
    );

    expect(
      await screen.findByText(API_KEYS_CARD_TITLE_TEXT),
    ).toBeInTheDocument();
  });

  it("renders Performance", async () => {
    jest.spyOn(launchDarkly, "useFlags").mockReturnValue({
      performancePage: true,
    });

    render(<Routes />, {
      initialRoute: PERFORMANCE_ROUTE,
      shouldRenderRouter: false,
    });

    await userEvent.click(
      await screen.findByRole("link", {
        name: SIDE_NAV_PERFORMANCE_LINK_TEXT,
      }),
    );

    expect(
      await screen.findByRole("heading", { name: PERFORMANCE_PAGE_TITLE }),
    ).toBeInTheDocument();
  });
});
