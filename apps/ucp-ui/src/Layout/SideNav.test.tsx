import React from "react";
import { render, screen, userEvent, waitFor } from "../shared/test/testUtils";
import Routes from "../Routes";
import { API_KEYS_CARD_TITLE_TEXT } from "../ApiKeys/constants";
import {
  SIDE_NAV_CONTACT_US_LINK_TEXT,
  SIDE_NAV_INSTITUTIONS_LINK_TEXT,
  SIDE_NAV_LOG_OUT_BUTTON_TEXT,
  SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
} from "./constants";
import { SUPPORT_EMAIL } from "../shared/constants/support";
import * as launchDarkly from "launchdarkly-react-client-sdk";
import SideNav from "./SideNav";
import {
  institutionRoute,
  INSTITUTIONS_ROUTE,
  widgetManagementRoute,
} from "../shared/constants/routes";

const mockLogout = jest.fn();

jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    logout: mockLogout,
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withAuthenticationRequired: (component: any): any => component,
}));

jest.mock("launchdarkly-react-client-sdk");

describe("<SideNav />", () => {
  beforeEach(() => {
    jest.spyOn(launchDarkly, "useFlags").mockReturnValue({});
  });

  it("calls logout on click", async () => {
    render(<Routes />, { shouldRenderRouter: false });

    await userEvent.click(screen.getByText(SIDE_NAV_LOG_OUT_BUTTON_TEXT));

    await waitFor(() => expect(mockLogout).toHaveBeenCalled());
  });

  it("doesnt render institutions if the flag is off", () => {
    jest.spyOn(launchDarkly, "useFlags").mockReturnValue({
      institutionsPage: false,
    });

    render(<Routes />, { shouldRenderRouter: false });

    expect(
      screen.queryByRole("link", {
        name: SIDE_NAV_INSTITUTIONS_LINK_TEXT,
      }),
    ).not.toBeInTheDocument();
  });

  it("renders institutions if the flag is on", () => {
    jest.spyOn(launchDarkly, "useFlags").mockReturnValue({
      institutionsPage: true,
    });

    render(<Routes />, { shouldRenderRouter: false });

    expect(
      screen.getByRole("link", {
        name: SIDE_NAV_INSTITUTIONS_LINK_TEXT,
      }),
    ).toBeInTheDocument();
  });

  it("navigates to widget management after clicking on the link", async () => {
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

  it("renders a contact us button", async () => {
    render(<Routes />, { shouldRenderRouter: false });

    const contactLink = await screen.findByText(SIDE_NAV_CONTACT_US_LINK_TEXT);

    expect(contactLink).toBeInTheDocument();

    expect(contactLink).toHaveAttribute("href", `mailto:${SUPPORT_EMAIL}`);
  });

  it("adds a selected status for each routes match paths", () => {
    jest.spyOn(launchDarkly, "useFlags").mockReturnValue({
      institutionsPage: true,
    });

    const result1 = render(<SideNav />, {
      initialRoute: institutionRoute.fullRoute,
    });

    expect(
      screen.getByTestId(`side-nav-link-${SIDE_NAV_INSTITUTIONS_LINK_TEXT}`),
    ).toHaveClass("Mui-selected");

    result1.unmount();

    const result2 = render(<SideNav />, { initialRoute: INSTITUTIONS_ROUTE });

    expect(
      screen.getByTestId(`side-nav-link-${SIDE_NAV_INSTITUTIONS_LINK_TEXT}`),
    ).toHaveClass("Mui-selected");

    result2.unmount();

    const result3 = render(<SideNav />, {
      initialRoute: widgetManagementRoute.fullRoute,
    });

    expect(
      screen.getByTestId(
        `side-nav-link-${SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT}`,
      ),
    ).toHaveClass("Mui-selected");

    result3.unmount();
  });
});
