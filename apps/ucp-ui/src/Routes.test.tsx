import React from "react";
import { render, screen, userEvent } from "./shared/test/testUtils";
import Routes from "./Routes";
import { WIDGET_MANAGEMENT_PAGE_TITLE_TEXT } from "./ApiKeys/constants";
import { INSTITUTIONS_PAGE_TITLE } from "./Institutions/constants";
import {
  SIDE_NAV_DEMO_LINK_TEXT,
  SIDE_NAV_INSTITUTIONS_LINK_TEXT,
  SIDE_NAV_PERFORMANCE_LINK_TEXT,
  SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
} from "./Layout/constants";
import { PERFORMANCE_PAGE_TITLE } from "./Performance/constants";
import { WIDGET_DEMO_PAGE_TITLE } from "./WidgetDemo/constants";
import { setAccessToken } from "../src/shared/reducers/token";
import { createFakeAccessToken } from "../src/shared/test/utils";
import { createStore } from "../src/store";

jest.mock("@auth0/auth0-react");

describe("<Routes />", () => {
  it("renders Performance by default", async () => {
    render(<Routes />, {
      shouldRenderRouter: false,
    });

    expect(
      await screen.findByRole("heading", { name: PERFORMANCE_PAGE_TITLE }),
    ).toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole("link", {
        name: SIDE_NAV_PERFORMANCE_LINK_TEXT,
      }),
    );

    expect(
      await screen.findByRole("heading", { name: PERFORMANCE_PAGE_TITLE }),
    ).toBeInTheDocument();
  });

  it("renders Institutions", async () => {
    render(<Routes />, { shouldRenderRouter: false });

    expect(
      screen.queryByRole("heading", { name: INSTITUTIONS_PAGE_TITLE }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole("link", {
        name: SIDE_NAV_INSTITUTIONS_LINK_TEXT,
      }),
    );

    expect(
      await screen.findByRole("heading", { name: INSTITUTIONS_PAGE_TITLE }),
    ).toBeInTheDocument();
  });

  it("renders widget demo", async () => {
    const accessTokenWithDemoPermission = createFakeAccessToken([
      "widget:demo",
    ]);
    const store = createStore();
    store.dispatch(setAccessToken(accessTokenWithDemoPermission));

    render(<Routes />, { shouldRenderRouter: false, store });
    expect(
      screen.queryByRole("heading", { name: WIDGET_DEMO_PAGE_TITLE }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      await screen.findByRole("link", {
        name: SIDE_NAV_DEMO_LINK_TEXT,
      }),
    );
    expect(
      await screen.findByRole("heading", { name: WIDGET_DEMO_PAGE_TITLE }),
    ).toBeInTheDocument();
  });

  it("renders Widget Management", async () => {
    render(<Routes />, { shouldRenderRouter: false });

    expect(
      screen.queryByRole("heading", {
        name: WIDGET_MANAGEMENT_PAGE_TITLE_TEXT,
      }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole("link", {
        name: SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: WIDGET_MANAGEMENT_PAGE_TITLE_TEXT,
      }),
    ).toBeInTheDocument();
  });
});
